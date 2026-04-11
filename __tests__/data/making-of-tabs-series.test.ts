import { makingOfTabsSeries, flattenMakingOfTabsSeries } from '../../src/data/making-of-tabs-series'

describe('making-of-tabs-series data', () => {
  it('exports a non-empty series array', () => {
    expect(makingOfTabsSeries.length).toBeGreaterThan(0)
  })

  it('all items have title and href', () => {
    function checkItems(items: typeof makingOfTabsSeries) {
      for (const item of items) {
        expect(item.title).toBeTruthy()
        expect(item.href).toBeTruthy()
        if (item.children) checkItems(item.children)
      }
    }
    checkItems(makingOfTabsSeries)
  })

  it('flattenMakingOfTabsSeries returns all items in order', () => {
    const flat = flattenMakingOfTabsSeries()
    expect(flat.length).toBeGreaterThan(0)
    expect(flat[0].title).toBe('Making of TABS')
    for (const item of flat) {
      expect(item.title).toBeTruthy()
      expect(item.href).toBeTruthy()
    }
  })
})
