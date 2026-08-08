import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import type { StudentProfile } from '../shared/types'
import { Profile } from './Profile'

const profile: StudentProfile = {
  version: 1,
  name: 'Жора',
  createdAt: '2026-08-09T00:00:00.000Z',
  level: 3,
  highestLevel: 4,
  appearanceTier: 1,
  sessions: [],
  audio: { enabled: true, music: .2, effects: .5 },
}

describe('профиль исследователя', () => {
  it('сохраняет все достижения и различает полученные, сломанные и закрытые', () => {
    render(<Profile profile={profile} onBack={vi.fn()} onRename={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Снаряжение исследователя' })).toBeInTheDocument()
    expect(screen.getAllByText('Получено')).toHaveLength(1)
    expect(screen.getAllByText('Сломано')).toHaveLength(1)
    expect(screen.getAllByText('Закрыто')).toHaveLength(8)
    expect(screen.getByText('Лупа')).toBeInTheDocument()
    expect(screen.getByText('Халат натуралиста')).toBeInTheDocument()
    expect(screen.getByText('Получи предмет заново')).toBeInTheDocument()
  })

  it('оставляет доступными навигацию и управление профилем', () => {
    const onBack = vi.fn()
    const onRename = vi.fn()
    const onReset = vi.fn()
    render(<Profile profile={profile} onBack={onBack} onRename={onRename} onReset={onReset} />)
    fireEvent.click(screen.getByRole('button', { name: '← На главную' }))
    fireEvent.click(screen.getByRole('button', { name: '✎ Изменить имя' }))
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить профиль' }))
    expect(onBack).toHaveBeenCalledOnce()
    expect(onRename).toHaveBeenCalledOnce()
    expect(onReset).toHaveBeenCalledOnce()
  })
})
