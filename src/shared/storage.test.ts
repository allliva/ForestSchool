import { addSession, createProfile, loadProfile, sampleUnique, saveProfile, STORAGE_KEY } from './storage'
import type { SessionRecord } from './types'

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
  it('добавляет завершённую сессию и сердца', () => {
    const record: SessionRecord = { id:'1', gameId:'frog', gameTitle:'Лягушка', modeId:'words', modeTitle:'Слова', completedAt:new Date().toISOString(), correct:8, total:10, percent:80, hearts:2 }
    const next = addSession(createProfile('Лев'), record)
    expect(next.totalHearts).toBe(2)
    expect(next.sessions).toHaveLength(1)
  })
  it('создаёт выборку без повторов', () => expect(new Set(sampleUnique([1,2,3,4], 3)).size).toBe(3))
})
