import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { SquirrelGame } from './SquirrelGame'
import { squirrelTasks, syllableLabel } from '../data/tasks'

vi.mock('../../../shared/audio', () => ({ audio: { play: vi.fn() } }))

function answerButton(correct: boolean) {
  const word = document.querySelector('.oak-drop strong')?.textContent?.toLocaleLowerCase('ru-RU')
  const task = squirrelTasks.find(item => item.word === word)
  if (!task) throw new Error(`Не найдено задание для слова ${word}`)
  const syllables = correct ? task.syllables : task.syllables === 1 ? 2 : 1
  return screen.getByRole('button', { name: `Положить жёлудь в сундук: ${syllableLabel(syllables)}` })
}

describe('игра белочки', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('показывает слово и три доступных сундука', () => {
    render(<SquirrelGame modeId="syllables" onFinish={vi.fn()} onFail={vi.fn()} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    expect(document.querySelector('.oak-drop strong')).toHaveTextContent(/[а-яё]+/i)
    expect(screen.getByRole('group', { name: 'Выбери сундук по количеству слогов' })).toBeVisible()
    expect(screen.getAllByRole('button', { name: /Положить жёлудь в сундук/ })).toHaveLength(3)
  })

  it('блокирует ввод, открывает сундук и переносит жёлудь при верном ответе', () => {
    render(<SquirrelGame modeId="syllables" onFinish={vi.fn()} onFail={vi.fn()} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    fireEvent.click(answerButton(true))
    expect(screen.getAllByRole('button', { name: /Положить жёлудь в сундук/ }).every(button => button.hasAttribute('disabled'))).toBe(true)
    expect(document.querySelector('.squirrel-stage')).toHaveClass('flight-to-squirrel')
    expect(document.querySelector('.oak-drop-fall')).toHaveAttribute('data-falling-away', 'true')
    act(() => vi.advanceTimersByTime(300))
    expect(document.querySelector('.squirrel-character img')).toHaveAttribute('src', expect.stringContaining('squirrel-catch-v2'))
    expect(document.querySelector('.flying-acorn')).not.toBeInTheDocument()
    expect(document.querySelector('.treasure-chest.selected img')).toHaveAttribute('src', expect.stringContaining('-open'))
    act(() => vi.advanceTimersByTime(230))
    expect(document.querySelector('.squirrel-character img')).toHaveAttribute('src', expect.stringContaining('squirrel-throw-v2'))
    expect(document.querySelector('.flying-acorn')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(270))
    expect(document.querySelectorAll('.squirrel-progress li.filled')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('Верно')
  })

  it('огорчает белочку и уменьшает запас, если жёлудь упал', () => {
    const onFail = vi.fn()
    render(<SquirrelGame modeId="syllables" level={100} onFinish={vi.fn()} onFail={onFail} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    act(() => vi.advanceTimersByTime(7000))
    expect(document.querySelector('.squirrel-character img')).toHaveAttribute('src', expect.stringContaining('squirrel-wrong-v2'))
    expect(screen.getByRole('status')).toHaveTextContent('Жёлудь упал')
    expect(document.querySelector('.answer-mark.wrong')).toHaveTextContent('×')
    act(() => vi.advanceTimersByTime(750))
    expect(onFail).toHaveBeenCalledWith(0, 1)
  })

  it('останавливает падение и ввод, пока открыта справка', () => {
    const onFail = vi.fn()
    const props = { modeId: 'syllables', level: 100, onFinish: vi.fn(), onFail, onExit: vi.fn(), onHelp: vi.fn(), onAudio: vi.fn() }
    const { rerender } = render(<SquirrelGame {...props}/>)
    act(() => vi.advanceTimersByTime(2000))
    rerender(<SquirrelGame {...props} isPaused/>)
    expect(document.querySelector('.squirrel-stage')).toHaveAttribute('data-paused', 'true')
    expect(screen.getAllByRole('button', { name: /Положить жёлудь в сундук/ }).every(button => button.hasAttribute('disabled'))).toBe(true)
    act(() => vi.advanceTimersByTime(10000))
    expect(onFail).not.toHaveBeenCalled()
    expect(document.querySelector('.squirrel-character img')).toHaveAttribute('src', expect.stringContaining('squirrel-idle-v2'))
    rerender(<SquirrelGame {...props} isPaused={false}/>)
    act(() => vi.advanceTimersByTime(3900))
    expect(onFail).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(900))
    expect(onFail).toHaveBeenCalledWith(0, 1)
  })

  it('завершает попытку поражением при ошибке на пустом запасе', () => {
    const onFail = vi.fn()
    const initialWord = document.querySelector('.oak-drop strong')?.textContent
    render(<SquirrelGame modeId="syllables" onFinish={vi.fn()} onFail={onFail} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    const word = document.querySelector('.oak-drop strong')?.textContent
    fireEvent.click(answerButton(false))
    act(() => vi.advanceTimersByTime(300))
    expect(document.querySelector('.answer-mark.wrong')).toHaveTextContent('×')
    expect(document.querySelector('.oak-drop strong')?.textContent).toBe(word ?? initialWord)
    act(() => vi.advanceTimersByTime(700))
    expect(onFail).toHaveBeenCalledWith(0, 1)
  })

  it('после обычной ошибки оставляет то же слово и возвращает ввод', () => {
    render(<SquirrelGame modeId="syllables" onFinish={vi.fn()} onFail={vi.fn()} onExit={vi.fn()} onHelp={vi.fn()} onAudio={vi.fn()}/>)
    fireEvent.click(answerButton(true))
    act(() => vi.advanceTimersByTime(1500))
    const word = document.querySelector('.oak-drop strong')?.textContent
    fireEvent.click(answerButton(false))
    act(() => vi.advanceTimersByTime(1050))
    expect(document.querySelector('.oak-drop strong')?.textContent).toBe(word)
    expect(screen.getAllByRole('button', { name: /Положить жёлудь в сундук/ }).every(button => !button.hasAttribute('disabled'))).toBe(true)
    expect(document.querySelectorAll('.squirrel-progress li.filled')).toHaveLength(0)
  })
})
