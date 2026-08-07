import type { ModeDefinition } from '../../../shared/types'

export type SquirrelMode = 'syllables'
export interface SquirrelTask { id: string; word: string; emoji: string; syllables: 1|2|3; sound: 'Гласный'|'Согласный'; softness?: 'Твёрдый'|'Мягкий' }

export const squirrelModes: ModeDefinition[] = [
  { id: 'syllables', title: 'Сколько слогов?', description: 'Помоги белочке разнести орехи по трём сундукам.', icon: '👏' },
]

export const squirrelTasks: SquirrelTask[] = [
  {id:'cat',word:'кот',emoji:'🐈',syllables:1,sound:'Согласный',softness:'Твёрдый'}, {id:'house',word:'дом',emoji:'🏠',syllables:1,sound:'Согласный',softness:'Твёрдый'}, {id:'fox',word:'лиса',emoji:'🦊',syllables:2,sound:'Согласный',softness:'Мягкий'}, {id:'car',word:'машина',emoji:'🚗',syllables:3,sound:'Согласный',softness:'Твёрдый'}, {id:'milk',word:'молоко',emoji:'🥛',syllables:3,sound:'Согласный',softness:'Твёрдый'},
  {id:'whale',word:'кит',emoji:'🐋',syllables:1,sound:'Согласный',softness:'Мягкий'}, {id:'forest',word:'лес',emoji:'🌲',syllables:1,sound:'Согласный',softness:'Мягкий'}, {id:'ball',word:'мяч',emoji:'⚽',syllables:1,sound:'Согласный',softness:'Мягкий'}, {id:'fish',word:'рыба',emoji:'🐟',syllables:2,sound:'Согласный',softness:'Твёрдый'}, {id:'frog',word:'лягушка',emoji:'🐸',syllables:3,sound:'Согласный',softness:'Мягкий'},
  {id:'duck',word:'утка',emoji:'🦆',syllables:2,sound:'Гласный'}, {id:'cloud',word:'облако',emoji:'☁️',syllables:3,sound:'Гласный'}, {id:'needle',word:'игла',emoji:'🪡',syllables:2,sound:'Гласный'}, {id:'watermelon',word:'арбуз',emoji:'🍉',syllables:2,sound:'Гласный'}, {id:'window',word:'окно',emoji:'🪟',syllables:2,sound:'Гласный'},
  {id:'lemon',word:'лимон',emoji:'🍋',syllables:2,sound:'Согласный',softness:'Мягкий'}, {id:'mouse',word:'мышка',emoji:'🐁',syllables:2,sound:'Согласный',softness:'Твёрдый'}, {id:'bear',word:'медведь',emoji:'🐻',syllables:2,sound:'Согласный',softness:'Мягкий'}, {id:'pumpkin',word:'тыква',emoji:'🎃',syllables:2,sound:'Согласный',softness:'Твёрдый'}, {id:'cup',word:'чашка',emoji:'☕',syllables:2,sound:'Согласный',softness:'Мягкий'},
]

export const syllableCategories = ['1 слог','2 слога','3 слога'] as const
export function answerForTask(task: SquirrelTask) { return task.syllables + ' ' + (task.syllables === 1 ? 'слог' : 'слога') }