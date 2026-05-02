import { sidebarSections } from '../../src/data/sidebar-navigation'

describe('sidebar-navigation makingOfTabsToGroups', () => {
  const makingOfTabsSection = sidebarSections.find((s) => s.id === 'making-of-tabs')

  it('exports a making-of-tabs section', () => {
    expect(makingOfTabsSection).toBeDefined()
  })

  describe('"How We Built It" group', () => {
    const group = makingOfTabsSection?.groups.find((g) => g.title === 'How We Built It')

    it('exists', () => {
      expect(group).toBeDefined()
    })

    it('includes the open-source parent link', () => {
      const hrefs = group?.links.map((l) => l.href) ?? []
      expect(hrefs).toContain('/making-of-tabs/open-source')
    })

    it('includes the research-value child link directly after open-source', () => {
      const hrefs = group?.links.map((l) => l.href) ?? []
      const openSourceIdx = hrefs.indexOf('/making-of-tabs/open-source')
      const researchValueIdx = hrefs.indexOf('/making-of-tabs/open-source/research-value')
      expect(openSourceIdx).toBeGreaterThan(-1)
      expect(researchValueIdx).toBe(openSourceIdx + 1)
    })
  })

  describe('"AI in TABS" group', () => {
    const group = makingOfTabsSection?.groups.find((g) => g.title === 'AI in TABS')

    it('exists', () => {
      expect(group).toBeDefined()
    })

    it('includes the ai-assisted-development parent link', () => {
      const hrefs = group?.links.map((l) => l.href) ?? []
      expect(hrefs).toContain('/making-of-tabs/ai-assisted-development')
    })

    it('includes the 50-reviewer-process child link', () => {
      const hrefs = group?.links.map((l) => l.href) ?? []
      expect(hrefs).toContain('/making-of-tabs/ai-assisted-development/50-reviewer-process')
    })

    it('includes the 50-reviewer-process link directly after squash-merge-incident', () => {
      const hrefs = group?.links.map((l) => l.href) ?? []
      const squashIdx = hrefs.indexOf(
        '/making-of-tabs/ai-assisted-development/squash-merge-incident'
      )
      const reviewerIdx = hrefs.indexOf(
        '/making-of-tabs/ai-assisted-development/50-reviewer-process'
      )
      expect(squashIdx).toBeGreaterThan(-1)
      expect(reviewerIdx).toBe(squashIdx + 1)
    })
  })

  describe('"How We Built It" group — cross-group isolation', () => {
    const howWeBuiltItGroup = makingOfTabsSection?.groups.find((g) => g.title === 'How We Built It')
    const allGroups = makingOfTabsSection?.groups ?? []

    it('contains no links starting with /making-of-tabs/ai- (AI Validity Checks, AI-Assisted Dev belong to AI in TABS)', () => {
      const hrefs = howWeBuiltItGroup?.links.map((l) => l.href) ?? []
      expect(hrefs.every((h) => !h.startsWith('/making-of-tabs/ai-'))).toBe(true)
    })

    it('contains no links starting with /making-of-tabs/integrations', () => {
      const hrefs = howWeBuiltItGroup?.links.map((l) => l.href) ?? []
      expect(hrefs.every((h) => !h.startsWith('/making-of-tabs/integrations'))).toBe(true)
    })

    it('contains no links starting with /making-of-tabs/seo', () => {
      const hrefs = howWeBuiltItGroup?.links.map((l) => l.href) ?? []
      expect(hrefs.every((h) => !h.startsWith('/making-of-tabs/seo'))).toBe(true)
    })

    it('contains no links starting with /making-of-tabs/mind-maps', () => {
      const hrefs = howWeBuiltItGroup?.links.map((l) => l.href) ?? []
      expect(hrefs.every((h) => !h.startsWith('/making-of-tabs/mind-maps'))).toBe(true)
    })

    it('contains no links starting with /making-of-tabs/tabs-presentation', () => {
      const hrefs = howWeBuiltItGroup?.links.map((l) => l.href) ?? []
      expect(hrefs.every((h) => !h.startsWith('/making-of-tabs/tabs-presentation'))).toBe(true)
    })

    it('has no href that also appears in another group (no duplicates across groups)', () => {
      const howWeBuiltItHrefs = new Set(howWeBuiltItGroup?.links.map((l) => l.href) ?? [])
      const otherHrefs = allGroups
        .filter((g) => g.title !== 'How We Built It')
        .flatMap((g) => g.links.map((l) => l.href))
      const duplicates = otherHrefs.filter((h) => howWeBuiltItHrefs.has(h))
      expect(duplicates).toHaveLength(0)
    })
  })
})
