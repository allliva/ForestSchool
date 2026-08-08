export const heartsForPercent = (percent: number) => percent === 100 ? 3 : percent >= 75 ? 2 : 1

export const LEVELS_PER_REWARD = 2

export const explorerRewards = [
  { unlockLevel: 2, icon: '🔍', item: 'Лупа', title: 'Наблюдатель тропинок' },
  { unlockLevel: 4, icon: '📓', item: 'Полевой блокнот', title: 'Следопыт-стажёр' },
  { unlockLevel: 6, icon: '🧭', item: 'Компас', title: 'Искатель маршрутов' },
  { unlockLevel: 8, icon: '🦋', item: 'Сачок', title: 'Ловец лесных тайн' },
  { unlockLevel: 10, icon: '🔭', item: 'Бинокль', title: 'Дозорный лесных крон' },
  { unlockLevel: 12, icon: '🔦', item: 'Фонарик', title: 'Разведчик сумерек' },
  { unlockLevel: 14, icon: '🧪', item: 'Пробирка', title: 'Лесной лаборант' },
  { unlockLevel: 16, icon: '🔬', item: 'Микроскоп', title: 'Исследователь микромира' },
  { unlockLevel: 18, icon: '🎒', item: 'Полевой рюкзак', title: 'Старший натуралист' },
  { unlockLevel: 20, icon: '🥼', item: 'Халат натуралиста', title: 'Хранитель лесной науки' },
] as const

export const rewardTierForLevel = (level: number) => Math.min(explorerRewards.length, Math.floor(Math.max(0, level) / LEVELS_PER_REWARD))

export const titleForLevel = (level: number) => rewardTierForLevel(level) === 0
  ? 'Начинающий исследователь'
  : explorerRewards[rewardTierForLevel(level) - 1].title

export const levelAfterOutcome = (level: number, outcome: 'win' | 'loss') => Math.max(0, Math.floor(level) + (outcome === 'win' ? 1 : -1))

// Алиасы сохраняют совместимость старых импортов и CSS-классов профиля.
export const appearanceTierForHearts = rewardTierForLevel
export const tierNames = ['Начинающий исследователь', ...explorerRewards.map(reward => reward.title)]
