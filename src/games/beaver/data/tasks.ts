import type { ModeDefinition } from '../../../shared/types'

export type BeaverMode = 'order'
export type BeaverDifficulty = 3 | 4 | 5 | 6
export interface BeaverTask { id: string; difficulty: BeaverDifficulty; words: string[]; displaySentence: string }
export interface BeaverWordToken { id: string; text: string; position: number }

export const beaverModes: ModeDefinition[] = [
  { id: 'order', title: 'Собери предложение', description: 'Выбирай брёвна-слова по порядку и построй надёжный мост.', icon: '🪵' },
]

export const beaverTasks: BeaverTask[] = [
  { id: 'sentence-3-01', difficulty: 3, words: ['бобр', 'строит', 'мост'], displaySentence: 'Бобр строит мост.' },
  { id: 'sentence-3-02', difficulty: 3, words: ['мама', 'варит', 'суп'], displaySentence: 'Мама варит суп.' },
  { id: 'sentence-3-03', difficulty: 3, words: ['папа', 'читает', 'газету'], displaySentence: 'Папа читает газету.' },
  { id: 'sentence-3-04', difficulty: 3, words: ['кошка', 'ловит', 'мышь'], displaySentence: 'Кошка ловит мышь.' },
  { id: 'sentence-3-05', difficulty: 3, words: ['девочка', 'моет', 'руки'], displaySentence: 'Девочка моет руки.' },
  { id: 'sentence-4-01', difficulty: 4, words: ['мальчик', 'рисует', 'красный', 'дом'], displaySentence: 'Мальчик рисует красный дом.' },
  { id: 'sentence-4-02', difficulty: 4, words: ['бабушка', 'печёт', 'сладкий', 'пирог'], displaySentence: 'Бабушка печёт сладкий пирог.' },
  { id: 'sentence-4-03', difficulty: 4, words: ['рыжая', 'белка', 'грызёт', 'орех'], displaySentence: 'Рыжая белка грызёт орех.' },
  { id: 'sentence-4-04', difficulty: 4, words: ['маленький', 'щенок', 'грызёт', 'тапок'], displaySentence: 'Маленький щенок грызёт тапок.' },
  { id: 'sentence-4-05', difficulty: 4, words: ['птица', 'строит', 'тёплое', 'гнездо'], displaySentence: 'Птица строит тёплое гнездо.' },
  { id: 'sentence-5-01', difficulty: 5, words: ['весёлый', 'бобр', 'несёт', 'тяжёлое', 'бревно'], displaySentence: 'Весёлый бобр несёт тяжёлое бревно.' },
  { id: 'sentence-5-02', difficulty: 5, words: ['мама', 'утром', 'варит', 'вкусную', 'кашу'], displaySentence: 'Мама утром варит вкусную кашу.' },
  { id: 'sentence-5-03', difficulty: 5, words: ['девочка', 'аккуратно', 'складывает', 'цветные', 'карандаши'], displaySentence: 'Девочка аккуратно складывает цветные карандаши.' },
  { id: 'sentence-5-04', difficulty: 5, words: ['сильный', 'ветер', 'качает', 'высокие', 'деревья'], displaySentence: 'Сильный ветер качает высокие деревья.' },
  { id: 'sentence-5-05', difficulty: 5, words: ['зайчик', 'быстро', 'прячет', 'сладкую', 'морковку'], displaySentence: 'Зайчик быстро прячет сладкую морковку.' },
  { id: 'sentence-6-01', difficulty: 6, words: ['маленький', 'бобр', 'быстро', 'строит', 'крепкий', 'мост'], displaySentence: 'Маленький бобр быстро строит крепкий мост.' },
  { id: 'sentence-6-02', difficulty: 6, words: ['девочка', 'после', 'школы', 'читает', 'интересную', 'книгу'], displaySentence: 'Девочка после школы читает интересную книгу.' },
  { id: 'sentence-6-03', difficulty: 6, words: ['рыжая', 'лиса', 'тихо', 'крадётся', 'к', 'норе'], displaySentence: 'Рыжая лиса тихо крадётся к норе.' },
  { id: 'sentence-6-04', difficulty: 6, words: ['летний', 'дождь', 'весело', 'стучит', 'по', 'крыше'], displaySentence: 'Летний дождь весело стучит по крыше.' },
  { id: 'sentence-6-05', difficulty: 6, words: ['старый', 'рыбак', 'утром', 'чинит', 'крепкую', 'лодку'], displaySentence: 'Старый рыбак утром чинит крепкую лодку.' },
]

export function shuffleItems<T>(items: readonly T[], random: () => number = Math.random) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function createBeaverSession(random: () => number = Math.random) {
  const counts: Record<BeaverDifficulty, number> = { 3: 1, 4: 3, 5: 3, 6: 3 }
  return ([3, 4, 5, 6] as BeaverDifficulty[]).flatMap(difficulty =>
    shuffleItems(beaverTasks.filter(task => task.difficulty === difficulty), random).slice(0, counts[difficulty]),
  )
}

export function createShuffledTokens(task: BeaverTask, random: () => number = Math.random) {
  const correct = task.words.map((text, position) => ({ id: `${task.id}-word-${position}`, text, position }))
  const shuffled = shuffleItems(correct, random)
  if (shuffled.every((token, index) => token.position === index) && shuffled.length > 1) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }
  return shuffled
}

export function isCorrectBridge(tokens: readonly BeaverWordToken[]) {
  return tokens.every((token, index) => token.position === index)
}
