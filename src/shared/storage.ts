import type { AudioSettings, SessionRecord, StudentProfile } from './types'
import { levelAfterOutcome, rewardTierForLevel } from './rewards'

export const STORAGE_KEY = 'forest-school:v1'
export const defaultAudio: AudioSettings = { enabled: true, music: 0.22, effects: 0.55 }

export function createProfile(name: string): StudentProfile {
  return { version: 1, name: name.trim().slice(0, 24), createdAt: new Date().toISOString(), totalHearts: 0, level: 0, highestLevel: 0, appearanceTier: 0, sessions: [], audio: defaultAudio }
}

function levelsFromSessions(sessions: SessionRecord[]) {
  let level = 0
  let highestLevel = 0
  for (const session of [...sessions].reverse()) {
    level = levelAfterOutcome(level, session.outcome)
    highestLevel = Math.max(highestLevel, level)
  }
  return { level, highestLevel }
}

export function loadProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<StudentProfile>
    if (value.version !== 1 || typeof value.name !== 'string' || !Array.isArray(value.sessions)) return null
    const totalHearts = Number.isFinite(value.totalHearts) ? Math.max(0, Number(value.totalHearts)) : 0
    const sessions = value.sessions.map(session => ({
      ...session,
      mistakes: Number.isFinite(session.mistakes) ? Math.max(0, Number(session.mistakes)) : 0,
      outcome: session.outcome === 'loss' ? 'loss' as const : 'win' as const,
    }))
    const rebuilt = levelsFromSessions(sessions)
    const level = Number.isFinite(value.level) ? Math.max(0, Math.floor(Number(value.level))) : rebuilt.level
    const highestLevel = Number.isFinite(value.highestLevel) ? Math.max(level, Math.floor(Number(value.highestLevel))) : Math.max(level, rebuilt.highestLevel)
    return { ...createProfile(value.name), ...value, sessions, totalHearts, level, highestLevel, appearanceTier: rewardTierForLevel(level), audio: { ...defaultAudio, ...(value.audio ?? {}) }, version: 1 }
  } catch { return null }
}

export function saveProfile(profile: StudentProfile) { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)) }
export function clearProfile() { localStorage.removeItem(STORAGE_KEY) }

export function addSession(profile: StudentProfile, record: SessionRecord): StudentProfile {
  const totalHearts = profile.totalHearts + record.hearts
  const level = levelAfterOutcome(profile.level, record.outcome)
  const highestLevel = Math.max(profile.highestLevel, level)
  return { ...profile, totalHearts, level, highestLevel, appearanceTier: rewardTierForLevel(level), sessions: [record, ...profile.sessions] }
}

export function sampleUnique<T>(items: readonly T[], count = 10): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length))
}
