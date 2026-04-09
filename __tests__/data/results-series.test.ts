import { resultsSeries, flattenResultsSeries } from '../../src/data/results-series'

describe('results-series data', () => {
  it('exports a non-empty series array', () => {
    expect(resultsSeries.length).toBeGreaterThan(0)
  })

  it('all items have title and href', () => {
    function checkItems(items: typeof resultsSeries) {
      for (const item of items) {
        expect(item.title).toBeTruthy()
        expect(item.href).toBeTruthy()
        if (item.children) checkItems(item.children)
      }
    }
    checkItems(resultsSeries)
  })

  it('flattenResultsSeries returns all items in order', () => {
    const flat = flattenResultsSeries()
    expect(flat.length).toBeGreaterThan(0)
    expect(flat[0].title).toBe('Results Overview')
    // Every item should have title and href
    for (const item of flat) {
      expect(item.title).toBeTruthy()
      expect(item.href).toBeTruthy()
    }
  })
})
