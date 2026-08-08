import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Results } from './Results'

it('показывает особое поздравление за полный комплект наград', () => {
  const action = vi.fn()
  render(<Results correct={10} total={10} level={20} levelChange={1} rewardName="Халат натуралиста" rewardIcon="🥼" collectionComplete onAgain={action} onModes={action} onHome={action}/>)
  expect(screen.getByRole('status', { name: 'Все награды собраны' })).toHaveTextContent('Поздравляем! Все награды собраны!')
  expect(screen.getByText('Ты — Хранитель лесной науки')).toBeInTheDocument()
})
