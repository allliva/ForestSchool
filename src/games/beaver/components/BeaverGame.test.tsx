import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, vi } from 'vitest'
import { BeaverGame } from './BeaverGame'

vi.mock('../../../shared/audio', () => ({ audio: { play: vi.fn() } }))

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})
describe('игра бобра', () => {
  it('переносит выбранное слово, возвращает последнее и сбрасывает мост', async () => {
    render(<BeaverGame modeId="order" onFinish={vi.fn()} onFail={vi.fn()} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    const bank = screen.getByRole('group', { name: 'Доступные брёвна' })
    const initialCount = bank.querySelectorAll('button').length
    fireEvent.click(bank.querySelector('button')!)
    expect(screen.getByLabelText('Слова на мосту').querySelectorAll('.placed-log')).toHaveLength(1)
    const undo = screen.getByRole('button', { name: 'Вернуть бревно' }) as HTMLButtonElement
    await waitFor(() => expect(undo.disabled).toBe(false))
    fireEvent.click(undo)
    expect(screen.getByLabelText('Слова на мосту').querySelectorAll('.placed-log')).toHaveLength(0)
    expect(bank.querySelectorAll('button')).toHaveLength(initialCount)
    fireEvent.click(bank.querySelector('button')!)
    const reset = screen.getByRole('button', { name: 'Очистить мост' }) as HTMLButtonElement
    await waitFor(() => expect(reset.disabled).toBe(false))
    fireEvent.click(reset)
    expect(screen.getByLabelText('Слова на мосту').querySelectorAll('.placed-log')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Пойти по мосту' })).toBeNull()
  })

  it('поддерживает клавиатурно доступные кнопки слов и три молоточка', () => {
    render(<BeaverGame modeId="order" onFinish={vi.fn()} onFail={vi.fn()} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    expect(screen.getByLabelText('Осталось молоточков: 3').querySelectorAll('img.active')).toHaveLength(3)
    for (const button of screen.getByRole('group', { name: 'Доступные брёвна' }).querySelectorAll('button')) {
      expect(button.getAttribute('type')).toBe('button')
      expect((button as HTMLButtonElement).disabled).toBe(false)
    }
  })
  it('засчитывает правильный мост и сразу увеличивает прогресс', async () => {
    render(<BeaverGame modeId="order" onFinish={vi.fn()} onFail={vi.fn()} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    for (const position of [0, 1, 2]) {
      const button = screen.getByRole('group', { name: 'Доступные брёвна' }).querySelector(`[data-token-id$="-word-${position}"]`) as HTMLButtonElement
      await waitFor(() => expect(button.disabled).toBe(false))
      fireEvent.click(button)
    }
    const check = screen.getByRole('button', { name: 'Пойти по мосту' }) as HTMLButtonElement
    await waitFor(() => expect(check.disabled).toBe(false))
    fireEvent.click(check)
    await screen.findByRole('button', { name: 'Дальше' })
    expect(screen.getByLabelText('Путь домой: 1 из 10')).toBeTruthy()
  })

  it('после третьего неверного моста завершает сессию поражением', async () => {
    const onFail = vi.fn()
    render(<BeaverGame modeId="order" onFinish={vi.fn()} onFail={onFail} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    for (let attempt = 0; attempt < 3; attempt += 1) {
      for (const position of [2, 1, 0]) {
        const button = screen.getByRole('group', { name: 'Доступные брёвна' }).querySelector(`[data-token-id$="-word-${position}"]`) as HTMLButtonElement
        await waitFor(() => expect(button.disabled).toBe(false))
        fireEvent.click(button)
      }
      const check = screen.getByRole('button', { name: 'Пойти по мосту' }) as HTMLButtonElement
      await waitFor(() => expect(check.disabled).toBe(false))
      fireEvent.click(check)
      if (attempt < 2) {
        const retry = await screen.findByRole('button', { name: 'Попробовать ещё' })
        fireEvent.click(retry)
      }
    }
    await waitFor(() => expect(onFail).toHaveBeenCalledWith(0, 3))
  })
})
