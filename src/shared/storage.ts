import type { AudioSettings, SessionRecord, StudentProfile } from './types'
import { appearanceTierForHearts } from './rewards'

export const STORAGE_KEY = 'forest-school:v1'
export const defaultAudio: AudioSettings = { enabled: true, music: 0.22, effects: 0.55 }

export function createProfile(name: string): StudentProfile {
  return { version: 1, name: name.trim().slice(0, 24), createdAt: new Date().toISOString(), totalHearts: 0, appearanceTier: 0, sessions: [], audio: defaultAudio }
}

export function loadProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<StudentProfile>
    if (value.version !== 1 || typeof value.name !== 'string' || !Array.isArray(value.sessions)) return null
    const totalHearts = Number.isFinite(value.totalHearts) ? Math.max(0, Number(value.totalHearts)) : 0
    return { ...createProfile(value.name), ...value, totalHearts, appearanceTier: appearanceTierForHearts(totalHearts), audio: { ...defaultAudio, ...(value.audio ?? {}) }, version: 1 }
  } catch { return null }
}

export function saveProfile(profile: StudentProfile) { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)) }
export function clearProfile() { localStorage.removeItem(STORAGE_KEY) }

export function addSession(profile: StudentProfile, record: SessionRecord): StudentProfile {
  const totalHearts = profile.totalHearts + record.hearts
  return { ...profile, totalHearts, appearanceTier: appearanceTierForHearts(totalHearts), sessions: [record, ...profile.sessions] }
}

export function sampleUnique<T>(items: readonly T[], count = 10): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, Math.min(count, items.length))
}
