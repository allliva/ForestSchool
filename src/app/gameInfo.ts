import type { GameId, ModeDefinition } from '../shared/types'
import { frogModes } from '../games/frog/data/tasks'
import { squirrelModes } from '../games/squirrel/data/tasks'
import { beaverModes } from '../games/beaver/data/tasks'

export interface GameInfo { id: GameId; title: string; subtitle: string; description: string; color: string; modes: ModeDefinition[]; instruction: string[] }

export const games: GameInfo[] = [
  { id: 'frog', title: 'Лягушка на болоте', subtitle: 'Словарные слова', description: 'Поймай нужную букву быстрым языком и помоги лягушке добраться до новой кувшинки.', color: '#71d36b', modes: frogModes, instruction: ['Посмотри на слово с пропуском.', 'Найди насекомое с подходящей буквой.', 'Нажми на него — лягушка поймает цель языком.', 'Если ошибёшься, попробуй ещё раз.'] },
  { id: 'squirrel', title: 'Белочка и кладовая', subtitle: 'Слоги', description: 'Лови жёлуди, считай слоги и помоги белочке наполнить кладовую.', color: '#ffad45', modes: squirrelModes, instruction: ['Прочитай слово на дубовом листе.', 'Прохлопай его и посчитай слоги.', 'Выбери сундук: 1, 2 или 3 слога.', 'Верный ответ добавит жёлудь, ошибка уберёт один. Если запас пуст, попытка завершится.'] },
  { id: 'beaver', title: 'Бобёр строит мост', subtitle: 'Предложения', description: 'Собирай предложения из круглых брёвен и помоги бобру перейти лесную реку.', color: '#61bdda', modes: beaverModes, instruction: ['Прочитай слова на круглых брёвнах.', 'Передавай их бобру в правильном порядке.', 'Нажми на бревно в мосту, чтобы вернуть его.', 'Когда предложение готово, проверь мост.'] },
]
