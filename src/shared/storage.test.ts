import { addSession, createProfile, loadProfile, sampleUnique, saveProfile, STORAGE_KEY } from './storage'
import type { SessionRecord } from './types'

const session = (id: string, outcome: 'win' | 'loss'): SessionRecord => ({ id, gameId:'frog', gameTitle:'Лягушка', modeId:'words', modeTitle:'Слова', completedAt:new Date().toISOString(), correct:8, total:10, percent:80, hearts:2, mistakes:2, outcome })

describe('локальный профиль', () => {
  beforeEach(() => localStorage.clear())

  it('сохраняет и читает профиль', () => {
    const profile = createProfile('Аня')
    saveProfile(profile)
    expect(loadProfile()?.name).toBe('Аня')
  })

  it('безопасно отвергает повреждённые данные', () => {
    localStorage.setItem(STORAGE_KEY, '{bad json')
    expect(loadProfile()).toBeNull()
  })

  it('победа повышает уровень, а поражение понижает', () => {
    const afterWin = addSession(createProfile('Лев'), session('1', 'win'))
    expect(afterWin.level).toBe(1)
    expect(afterWin.totalHearts).toBe(2)
    const afterLoss = addSession(afterWin, session('2', 'loss'))
    expect(afterLoss.level).toBe(0)
    expect(afterLoss.highestLevel).toBe(1)
    expect(afterLoss.sessions).toHaveLength(2)
  })

  it('потерянная награда остаётся отмеченной высшим достигнутым уровнем', () => {
    const levelOne = addSession(createProfile('Лев'), session('1', 'win'))
    const levelTwo = addSession(levelOne, session('2', 'win'))
    expect(levelTwo.appearanceTier).toBe(1)
    const dropped = addSession(levelTwo, session('3', 'loss'))
    expect(dropped.level).toBe(1)
    expect(dropped.highestLevel).toBe(2)
    expect(dropped.appearanceTier).toBe(0)
  })

  it('восстанавливает уровни старого профиля из истории', () => {
    const oldProfile = { ...createProfile('Маша'), level: undefined, highestLevel: undefined, sessions: [session('3', 'loss'), session('2', 'win'), session('1', 'win')] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldProfile))
    const loaded = loadProfile()
    expect(loaded?.level).toBe(1)
    expect(loaded?.highestLevel).toBe(2)
  })

  it('создаёт выборку без повторов', () => expect(new Set(sampleUnique([1,2,3,4], 3)).size).toBe(3))
})
