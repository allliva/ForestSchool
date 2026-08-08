import type { ModeDefinition } from '../../../shared/types'

export type SquirrelMode = 'syllables'
export type SyllableCount = 1 | 2 | 3

export interface SquirrelTask {
  id: string
  word: string
  syllables: SyllableCount
}

export const SQUIRREL_GOAL = 10
export const SQUIRREL_SCORED_TURNS = 10

export const squirrelModes: ModeDefinition[] = [
  { id: 'syllables', title: 'Сколько слогов?', description: 'Помоги белочке разнести жёлуди по трём сундукам.', icon: '👏' },
]

export const squirrelTasks: SquirrelTask[] = [
  { id: 'cat', word: 'кот', syllables: 1 },
  { id: 'house', word: 'дом', syllables: 1 },
  { id: 'juice', word: 'сок', syllables: 1 },
  { id: 'cheese', word: 'сыр', syllables: 1 },
  { id: 'ball', word: 'мяч', syllables: 1 },
  { id: 'forest', word: 'лес', syllables: 1 },
  { id: 'poppy', word: 'мак', syllables: 1 },
  { id: 'onion', word: 'лук', syllables: 1 },
  { id: 'mushroom', word: 'гриб', syllables: 1 },
  { id: 'sphere', word: 'шар', syllables: 1 },
  { id: 'water', word: 'вода', syllables: 2 },
  { id: 'fox', word: 'лиса', syllables: 2 },
  { id: 'owl', word: 'сова', syllables: 2 },
  { id: 'fish', word: 'рыба', syllables: 2 },
  { id: 'porridge', word: 'каша', syllables: 2 },
  { id: 'mother', word: 'мама', syllables: 2 },
  { id: 'rose', word: 'роза', syllables: 2 },
  { id: 'hand', word: 'рука', syllables: 2 },
  { id: 'leg', word: 'нога', syllables: 2 },
  { id: 'winter', word: 'зима', syllables: 2 },
  { id: 'milk', word: 'молоко', syllables: 3 },
  { id: 'car', word: 'машина', syllables: 3 },
  { id: 'crow', word: 'ворона', syllables: 3 },
  { id: 'cow', word: 'корова', syllables: 3 },
  { id: 'raspberry', word: 'малина', syllables: 3 },
  { id: 'dog', word: 'собака', syllables: 3 },
  { id: 'rainbow', word: 'радуга', syllables: 3 },
  { id: 'apple', word: 'яблоко', syllables: 3 },
  { id: 'girl', word: 'девочка', syllables: 3 },
  { id: 'street', word: 'улица', syllables: 3 },
]

export const syllableCategories: readonly SyllableCount[] = [1, 2, 3]

export function syllableLabel(count: SyllableCount) {
  return `${count} ${count === 1 ? 'слог' : 'слога'}`
}

export function answerForTask(task: SquirrelTask) {
  return syllableLabel(task.syllables)
}

export function shuffleSquirrelTasks(random = Math.random) {
  const shuffled = [...squirrelTasks]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  return shuffled
}

export function squirrelTaskForTurn(tasks: SquirrelTask[], turn: number) {
  return tasks[turn % tasks.length]
}

export function nextSquirrelProgress(progress: number, correct: boolean) {
  return Math.max(0, Math.min(SQUIRREL_GOAL, progress + (correct ? 1 : -1)))
}

export function hasFilledPantry(progress: number) {
  return progress >= SQUIRREL_GOAL
}

export function squirrelFallSpeedMultiplier(progress: number) {
  const stage = Math.max(0, Math.min(SQUIRREL_GOAL, progress))
  return 1 + stage * 2 / SQUIRREL_GOAL
}

export function squirrelFallDuration(level: number, progress = 0) {
  const baseDuration = Math.max(6, 14 - Math.max(0, Math.floor(level)) * .8)
  return Math.max(3, baseDuration / squirrelFallSpeedMultiplier(progress))
}
