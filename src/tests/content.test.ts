import { frogTasks } from '../games/frog/data/tasks'
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
  it('банк слогов содержит все три категории', () => expect(new Set(squirrelTasks.map(t => t.syllables))).toEqual(new Set([1, 2, 3])))
})
