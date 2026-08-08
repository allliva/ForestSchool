import {
  SQUIRREL_GOAL,
  hasFilledPantry,
  nextSquirrelProgress,
  shuffleSquirrelTasks,
  squirrelTaskForTurn,
  squirrelFallDuration,
  squirrelTasks,
  syllableLabel,
} from './tasks'

describe('банк и прогресс белочки', () => {
  it('содержит 30 уникальных слов — по 10 для каждого количества слогов', () => {
    expect(squirrelTasks).toHaveLength(30)
    expect(new Set(squirrelTasks.map(task => task.id))).toHaveLength(30)
    expect(new Set(squirrelTasks.map(task => task.word))).toHaveLength(30)
    for (const syllables of [1, 2, 3] as const) {
      expect(squirrelTasks.filter(task => task.syllables === syllables)).toHaveLength(10)
    }
  })

  it('строит правильные подписи сундуков', () => {
    expect(syllableLabel(1)).toBe('1 слог')
    expect(syllableLabel(2)).toBe('2 слога')
    expect(syllableLabel(3)).toBe('3 слога')
  })

  it('перемешивает банк один раз и повторяет тот же порядок по кругу', () => {
    const shuffled = shuffleSquirrelTasks(() => .42)
    expect(new Set(shuffled.map(task => task.id))).toHaveLength(30)
    expect(squirrelTaskForTurn(shuffled, 30)).toBe(shuffled[0])
    expect(squirrelTaskForTurn(shuffled, 59)).toBe(shuffled[29])
  })

  it('ускоряет падение с уровнем, но сохраняет безопасный минимум', () => {
    expect(squirrelFallDuration(0)).toBe(14)
    expect(squirrelFallDuration(10)).toBe(10)
    expect(squirrelFallDuration(100)).toBe(7)
    expect(squirrelFallDuration(-4)).toBe(14)
  })

  it('держит запас в границах от нуля до десяти', () => {
    expect(nextSquirrelProgress(0, false)).toBe(0)
    expect(nextSquirrelProgress(4, false)).toBe(3)
    expect(nextSquirrelProgress(4, true)).toBe(5)
    expect(nextSquirrelProgress(SQUIRREL_GOAL, true)).toBe(SQUIRREL_GOAL)
    expect(hasFilledPantry(9)).toBe(false)
    expect(hasFilledPantry(10)).toBe(true)
  })
})
