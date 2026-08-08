import type { ModeDefinition } from '../../../shared/types'
import words from './words.json'

interface FrogWordRecord { id: string; word: string; missingIndex: number; options: string[] }
export interface FrogTask extends FrogWordRecord { missing: string }

export const frogModes: ModeDefinition[] = [{ id: 'words', title: 'Словарные слова', description: 'Поймай букву, которая спряталась из слова.', icon: '✨' }]
export const FROG_GOAL = 10
export const FROG_SCORED_TURNS = 10

export function frogSpeedMultiplier(progress: number) {
  const stage = Math.max(0, Math.min(FROG_GOAL, progress))
  return 1 + stage * 4 / FROG_GOAL
}

export const frogTasks: FrogTask[] = (words as FrogWordRecord[]).map(record => ({
  ...record,
  missing: record.word[record.missingIndex],
}))

export function shuffleFrogTasks(random = Math.random) {
  const shuffled = [...frogTasks]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  return shuffled
}

export function frogTaskForTurn(tasks: FrogTask[], turn: number) {
  return tasks[turn % tasks.length]
}

export function hiddenWord(task: FrogTask) {
  return `${task.word.slice(0, task.missingIndex)}_${task.word.slice(task.missingIndex + 1)}`
}

export function hasReachedFrogCrown(progress: number) {
  return progress >= FROG_GOAL
}