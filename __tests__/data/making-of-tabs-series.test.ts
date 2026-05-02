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

  it('includes research-value as a child of open-source and appears directly after it in the flat sequence', () => {
    const flat = flattenMakingOfTabsSeries()
    const openSourceIdx = flat.findIndex((i) => i.href === '/making-of-tabs/open-source')
    const researchValueIdx = flat.findIndex(
      (i) => i.href === '/making-of-tabs/open-source/research-value'
    )
    expect(openSourceIdx).toBeGreaterThan(-1)
    expect(researchValueIdx).toBe(openSourceIdx + 1)
  })

  it('includes 50-reviewer-process as a child of ai-assisted-development and appears after squash-merge-incident', () => {
    const flat = flattenMakingOfTabsSeries()
    const squashIdx = flat.findIndex(
      (i) => i.href === '/making-of-tabs/ai-assisted-development/squash-merge-incident'
    )
    const reviewerIdx = flat.findIndex(
      (i) => i.href === '/making-of-tabs/ai-assisted-development/50-reviewer-process'
    )
    expect(squashIdx).toBeGreaterThan(-1)
    expect(reviewerIdx).toBe(squashIdx + 1)
  })
})
