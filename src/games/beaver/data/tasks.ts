import type { ModeDefinition } from '../../../shared/types'

export type BeaverMode = 'order'
export interface BeaverTask { id: string; words: string[]; punctuation: '.'|'?'|'!'; extra: string }

export const beaverModes: ModeDefinition[] = [
  { id: 'order', title: 'Собери предложение', description: 'Передавай бобру круглые брёвна-слова и построй мост.', icon: '🪵' },
]

export const beaverTasks: BeaverTask[] = [
  {id:'masha',words:['Маша','читает','книгу'],punctuation:'.',extra:'быстрое'},
  {id:'cat',words:['Кот','спит','на','окне'],punctuation:'.',extra:'зелёный'},
  {id:'birds',words:['Птицы','летят','на','юг'],punctuation:'.',extra:'книга'},
  {id:'rain',words:['Когда','закончится','дождь'],punctuation:'?',extra:'сладкий'},
  {id:'friend',words:['Ты','придёшь','ко','мне'],punctuation:'?',extra:'дерево'},
  {id:'spring',words:['Как','красива','весна'],punctuation:'!',extra:'читает'},
  {id:'puppy',words:['Щенок','весело','играет'],punctuation:'.',extra:'синяя'},
  {id:'forest',words:['В','лесу','растут','грибы'],punctuation:'.',extra:'летит'},
  {id:'school',words:['Ребята','идут','в','школу'],punctuation:'.',extra:'вкусный'},
  {id:'name',words:['Как','тебя','зовут'],punctuation:'?',extra:'плывёт'},
  {id:'sun',words:['Солнце','ярко','светит'],punctuation:'.',extra:'мягкая'},
  {id:'hurray',words:['Мы','победили'],punctuation:'!',extra:'река'},
]
