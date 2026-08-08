import summerStreams from './summer-streams.mp3'
import type { SoundName } from '../../../shared/audio'

export const musicUrl = summerStreams
export const beaverSoundTheme = {
  pick: 'wood',
  place: 'place',
  correct: 'correct',
  crack: 'crack',
  splash: 'splash',
  hammerLost: 'hammerLost',
  finish: 'finish',
} satisfies Record<string, SoundName>
