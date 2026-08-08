import { frogSpeedMultiplier, frogTaskForTurn, frogTasks, hasReachedFrogCrown, hiddenWord, shuffleFrogTasks } from '../games/frog/data/tasks'
import { squirrelTasks } from '../games/squirrel/data/tasks'
import { beaverTasks, beaverModes } from '../games/beaver/data/tasks'

describe('библиотеки заданий', () => {
  it('содержат не менее десяти уникальных заданий на сессию', () => {
    expect(new Set(frogTasks.map(t => t.id)).size).toBeGreaterThanOrEqual(10)
    expect(new Set(squirrelTasks.map(t => t.id)).size).toBeGreaterThanOrEqual(10)
    expect(new Set(beaverTasks.map(t => t.id)).size).toBeGreaterThanOrEqual(10)
  })
  it('дают по одному сфокусированному режиму на игру', async () => {
    const { frogModes } = await import('../games/frog/data/tasks')
    const { squirrelModes } = await import('../games/squirrel/data/tasks')
    expect(frogModes.length + squirrelModes.length + beaverModes.length).toBe(3)
    expect([frogModes.length, squirrelModes.length, beaverModes.length]).toEqual([1, 1, 1])
  })
  it('банк лягушки содержит 20 корректных словарных слов', () => {
    expect(frogTasks).toHaveLength(20)
    for (const task of frogTasks) {
      expect(task.word[task.missingIndex]).toBe(task.missing)
      expect(task.options).toContain(task.missing)
    }
    expect(frogTasks.map(hiddenWord)).toEqual([
      'м_шина', 'с_бака', 'в_рона', 'к_рандаш', 'б_рёза',
      'в_робей', 'с_рока', 'м_роз', 'дев_чка', 'уч_ник',
      'т_традь', 'м_дведь', 'л_сица', 'за_ц', 'м_локо',
      'гор_д', 'д_рога', 'ябл_ко', 'к_ртофель', 'п_льто',
    ])
  })
  it('перемешивает все 20 слов и затем повторяет весь массив по кругу', () => {
    const shuffled = shuffleFrogTasks(() => .42)
    expect(shuffled).toHaveLength(20)
    expect(new Set(shuffled.map(task => task.id)).size).toBe(20)
    expect(frogTaskForTurn(shuffled, 20)).toBe(shuffled[0])
    expect(frogTaskForTurn(shuffled, 39)).toBe(shuffled[19])
    expect(hasReachedFrogCrown(9)).toBe(false)
    expect(hasReachedFrogCrown(10)).toBe(true)
  })
  it('меняет скорость мух вместе с этапом прохождения', () => {
    expect(frogSpeedMultiplier(0)).toBe(1)
    expect(frogSpeedMultiplier(5)).toBe(3)
    expect(frogSpeedMultiplier(10)).toBe(5)
    expect(frogSpeedMultiplier(-2)).toBe(1)
    expect(frogSpeedMultiplier(20)).toBe(5)
  })
  it('банк слогов содержит все три категории', () => expect(new Set(squirrelTasks.map(t => t.syllables))).toEqual(new Set([1, 2, 3])))
})
