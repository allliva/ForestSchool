import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Welcome } from './Welcome'

describe('приветственный экран', () => {
  it('создаёт профиль только с непустым именем', () => {
    const onCreate = vi.fn()
    render(<Welcome onCreate={onCreate} />)
    const button = screen.getByRole('button', { name: 'Войти в лес' })
    expect(button).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Как тебя зовут?'), { target: { value: 'Миша' } })
    fireEvent.click(button)
    expect(onCreate).toHaveBeenCalledWith('Миша')
  })
})
