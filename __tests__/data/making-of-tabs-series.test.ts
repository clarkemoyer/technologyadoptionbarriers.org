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

  it('research-value is nested as a child of the open-source item in the raw series (not top-level)', () => {
    const openSourceItem = makingOfTabsSeries.find((i) => i.href === '/making-of-tabs/open-source')
    expect(openSourceItem).toBeDefined()
    expect(openSourceItem?.children).toBeDefined()
    const childHrefs = openSourceItem?.children?.map((c) => c.href) ?? []
    expect(childHrefs).toContain('/making-of-tabs/open-source/research-value')
    // must NOT appear at the top level of makingOfTabsSeries
    const topLevelHrefs = makingOfTabsSeries.map((i) => i.href)
    expect(topLevelHrefs).not.toContain('/making-of-tabs/open-source/research-value')
  })

  it('50-reviewer-process is nested as a child of ai-assisted-development in the raw series (not top-level)', () => {
    const aiItem = makingOfTabsSeries.find(
      (i) => i.href === '/making-of-tabs/ai-assisted-development'
    )
    expect(aiItem).toBeDefined()
    expect(aiItem?.children).toBeDefined()
    const childHrefs = aiItem?.children?.map((c) => c.href) ?? []
    expect(childHrefs).toContain('/making-of-tabs/ai-assisted-development/50-reviewer-process')
    // must NOT appear at the top level of makingOfTabsSeries
    const topLevelHrefs = makingOfTabsSeries.map((i) => i.href)
    expect(topLevelHrefs).not.toContain(
      '/making-of-tabs/ai-assisted-development/50-reviewer-process'
    )
  })
})
