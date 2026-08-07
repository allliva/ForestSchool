import type { ModeDefinition } from '../../../shared/types'

export interface FrogTask { id: string; word: string; missing: string; options: string[]; hint: string }
export const frogModes: ModeDefinition[] = [{ id: 'words', title: 'Словарные слова', description: 'Поймай букву, которая спряталась из слова.', icon: '✨' }]

export const frogTasks: FrogTask[] = [
  ['machine','машина','а',['а','о','и'],'Транспорт'], ['dog','собака','о',['а','о','у'],'Домашний друг'], ['crow','ворона','о',['а','о','е'],'Чёрная птица'], ['pencil','карандаш','а',['о','а','и'],'Им рисуют'], ['birch','берёза','е',['и','е','я'],'Белое дерево'], ['sparrow','воробей','о',['а','о','е'],'Маленькая птица'], ['magpie','сорока','о',['а','о','у'],'Птица с белыми боками'], ['frost','мороз','о',['а','о','е'],'Зимний холод'], ['girl','девочка','е',['и','е','я'],'Юная ученица'], ['student','ученик','е',['и','е','я'],'Учится в школе'], ['notebook','тетрадь','е',['и','е','я'],'В ней пишут'], ['bear','медведь','е',['и','е','я'],'Лесной великан'], ['fox','лисица','и',['е','и','я'],'Рыжая плутовка'], ['hare','заяц','а',['о','а','я'],'Длинные уши'], ['milk','молоко','о',['а','о','е'],'Белый напиток'], ['city','город','о',['а','о','е'],'Много домов'], ['road','дорога','о',['а','о','у'],'По ней идут'], ['apple','яблоко','о',['а','о','е'],'Фрукт'], ['potato','картофель','а',['о','а','е'],'Овощ'], ['coat','пальто','а',['о','а','я'],'Верхняя одежда'],
].map(([id, word, missing, options, hint]) => ({ id, word, missing, options, hint } as FrogTask))

export function hiddenWord(task: FrogTask) { const index = task.word.indexOf(task.missing); return `${task.word.slice(0,index)}_${task.word.slice(index+1)}` }
