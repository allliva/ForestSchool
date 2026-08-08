import { beaverTasks, createBeaverSession, createShuffledTokens, isCorrectBridge } from './tasks'

describe('данные игры бобра', () => {
  it('содержат по пять предложений каждой длины', () => {
    expect(beaverTasks).toHaveLength(20)
    for (const difficulty of [3, 4, 5, 6]) {
      expect(beaverTasks.filter(task => task.difficulty === difficulty)).toHaveLength(5)
    }
    expect(new Set(beaverTasks.map(task => task.id)).size).toBe(20)
  })

  it('создаёт сессию из десяти уникальных раундов с распределением 1/3/3/3', () => {
    const session = createBeaverSession(() => .42)
    expect(session).toHaveLength(10)
    expect(new Set(session.map(task => task.id)).size).toBe(10)
    expect(session.map(task => task.difficulty)).toEqual([3, 4, 4, 4, 5, 5, 5, 6, 6, 6])
  })

  it('никогда не показывает слова сразу в правильном порядке', () => {
    for (const task of beaverTasks) {
      const tokens = createShuffledTokens(task, () => .999)
      expect(tokens).toHaveLength(task.words.length)
      expect(isCorrectBridge(tokens)).toBe(false)
      expect(new Set(tokens.map(token => token.id)).size).toBe(task.words.length)
    }
  })

  it('проверяет порядок по позициям токенов, а не по тексту', () => {
    const task = beaverTasks[0]
    const tokens = task.words.map((text, position) => ({ id: `word-${position}`, text, position }))
    expect(isCorrectBridge(tokens)).toBe(true)
    expect(isCorrectBridge([tokens[1], tokens[0], tokens[2]])).toBe(false)
  })
})
