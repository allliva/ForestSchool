import type { SoundName } from '../../../shared/audio'
import musicUrl from './autumn-forest.mp3'

export { musicUrl }

export const squirrelSoundTheme = {
  press: 'tap',
  chest: 'chest',
  catch: 'catch',
  correct: 'correct',
  wrong: 'wrong',
  finish: 'finish',
} satisfies Record<string, SoundName>
