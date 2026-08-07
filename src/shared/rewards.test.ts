import { appearanceTierForHearts, heartsForPercent } from './rewards'

describe('награды', () => {
  it('выдаёт сердца по порогам', () => {
    expect(heartsForPercent(0)).toBe(1)
    expect(heartsForPercent(74)).toBe(1)
    expect(heartsForPercent(75)).toBe(2)
    expect(heartsForPercent(99)).toBe(2)
    expect(heartsForPercent(100)).toBe(3)
  })
  it('открывает уровень каждые пять сердец и ограничивает двадцатым', () => {
    expect(appearanceTierForHearts(4)).toBe(0)
    expect(appearanceTierForHearts(5)).toBe(1)
    expect(appearanceTierForHearts(99)).toBe(19)
    expect(appearanceTierForHearts(100)).toBe(20)
    expect(appearanceTierForHearts(500)).toBe(20)
  })
})
