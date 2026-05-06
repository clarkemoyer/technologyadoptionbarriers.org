import { joinItems } from '../../src/lib/joinItems'

describe('joinItems', () => {
  it('returns empty string for an empty array', () => {
    expect(joinItems([])).toBe('')
  })

  it('returns the single item for a one-element array', () => {
    expect(joinItems(['Apple'])).toBe('Apple')
  })

  it('joins two items with "and"', () => {
    expect(joinItems(['Apple', 'Banana'])).toBe('Apple and Banana')
  })

  it('joins three items with Oxford comma', () => {
    expect(joinItems(['Apple', 'Banana', 'Cherry'])).toBe('Apple, Banana, and Cherry')
  })

  it('joins four items with Oxford comma', () => {
    expect(joinItems(['A', 'B', 'C', 'D'])).toBe('A, B, C, and D')
  })
})
