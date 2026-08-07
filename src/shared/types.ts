export type GameId = 'frog' | 'squirrel' | 'beaver'

export interface AudioSettings { enabled: boolean; music: number; effects: number }

export interface SessionRecord {
  id: string
  gameId: GameId
  gameTitle: string
  modeId: string
  modeTitle: string
  completedAt: string
  correct: number
  total: number
  percent: number
  hearts: number
}

export interface StudentProfile {
  version: 1
  name: string
  createdAt: string
  totalHearts: number
  appearanceTier: number
  sessions: SessionRecord[]
  audio: AudioSettings
}

export interface ModeDefinition { id: string; title: string; description: string; icon: string }

export interface SessionResult { correct: number; total: number }
