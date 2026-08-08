import { explorerRewards, heartsForPercent, levelAfterOutcome, rewardTierForLevel, titleForLevel } from './rewards'

describe('награды', () => {
  it('выдаёт сердца по порогам', () => {
    expect(heartsForPercent(0)).toBe(1)
    expect(heartsForPercent(74)).toBe(1)
    expect(heartsForPercent(75)).toBe(2)
    expect(heartsForPercent(99)).toBe(2)
    expect(heartsForPercent(100)).toBe(3)
  })

  it('повышает уровень за победу и понижает за поражение', () => {
    expect(levelAfterOutcome(3, 'win')).toBe(4)
    expect(levelAfterOutcome(3, 'loss')).toBe(2)
    expect(levelAfterOutcome(0, 'loss')).toBe(0)
  })

  it('открывает десять предметов каждые два уровня', () => {
    expect(explorerRewards).toHaveLength(10)
    expect(rewardTierForLevel(1)).toBe(0)
    expect(rewardTierForLevel(2)).toBe(1)
    expect(rewardTierForLevel(19)).toBe(9)
    expect(rewardTierForLevel(20)).toBe(10)
    expect(rewardTierForLevel(200)).toBe(10)
    expect(new Set(explorerRewards.map(reward => reward.item)).size).toBe(10)
  })

  it('повышает звание вместе со ступенью', () => {
    expect(titleForLevel(0)).toBe('Начинающий исследователь')
    expect(titleForLevel(2)).toBe('Наблюдатель тропинок')
    expect(titleForLevel(20)).toBe('Хранитель лесной науки')
  })
})
