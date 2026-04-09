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

  it('contains no duplicate hrefs among navigable items', () => {
    const flat = flattenResultsSeries()
    const hrefs = flat.map((item) => item.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('flattenResultsSeries excludes group-only nodes', () => {
    const flat = flattenResultsSeries()
    const groupItems = resultsSeries.filter((item) => item.isGroup)
    for (const group of groupItems) {
      expect(flat.find((f) => f.href === group.href && f.title === group.title)).toBeUndefined()
    }
  })

  it('flattenResultsSeries returns all navigable items in order', () => {
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
