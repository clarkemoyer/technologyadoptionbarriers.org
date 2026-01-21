import { personas, getPersonaBySlug, getPersonaSlugs, SURVEY_URL } from '../../src/lib/personas'

describe('Personas Library', () => {
  it('should export the correct number of personas', () => {
    expect(personas).toHaveLength(11)
  })

  it('should include all expected roles', () => {
    const expectedRoles = [
      'ceo',
      'cfo',
      'cio',
      'ciso',
      'coo',
      'cmo',
      'cto',
      'cso',
      'chro',
      'cro',
      'other',
    ]
    const actualSlugs = personas.map((p) => p.slug)
    expectedRoles.forEach((role) => {
      expect(actualSlugs).toContain(role)
    })
  })

  it('should have all required properties for each persona', () => {
    personas.forEach((persona) => {
      expect(persona).toHaveProperty('id')
      expect(persona).toHaveProperty('slug')
      expect(persona).toHaveProperty('title')
      expect(persona).toHaveProperty('shortTitle')
      expect(persona).toHaveProperty('description')
      expect(persona).toHaveProperty('whyItMatters')
      expect(persona).toHaveProperty('whatYouGet')
      expect(persona).toHaveProperty('surveyUrl')
    })
  })

  it('should have at least 3 items in whyItMatters for each persona', () => {
    personas.forEach((persona) => {
      expect(persona.whyItMatters.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('should have at least 3 items in whatYouGet for each persona', () => {
    personas.forEach((persona) => {
      expect(persona.whatYouGet.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('should link all personas to the survey URL', () => {
    personas.forEach((persona) => {
      expect(persona.surveyUrl).toBe(SURVEY_URL)
    })
  })

  describe('getPersonaBySlug', () => {
    it('should return the correct persona for a valid slug', () => {
      const ceo = getPersonaBySlug('ceo')
      expect(ceo).toBeDefined()
      expect(ceo?.slug).toBe('ceo')
      expect(ceo?.title).toBe('Chief Executive Officer')
    })

    it('should return undefined for an invalid slug', () => {
      const invalid = getPersonaBySlug('invalid-role')
      expect(invalid).toBeUndefined()
    })

    it('should return the correct persona for all valid slugs', () => {
      const slugs = getPersonaSlugs()
      slugs.forEach((slug) => {
        const persona = getPersonaBySlug(slug)
        expect(persona).toBeDefined()
        expect(persona?.slug).toBe(slug)
      })
    })
  })

  describe('getPersonaSlugs', () => {
    it('should return an array of all persona slugs', () => {
      const slugs = getPersonaSlugs()
      expect(slugs).toHaveLength(11)
      expect(slugs).toContain('ceo')
      expect(slugs).toContain('other')
    })

    it('should return slugs in the same order as personas', () => {
      const slugs = getPersonaSlugs()
      const expectedSlugs = personas.map((p) => p.slug)
      expect(slugs).toEqual(expectedSlugs)
    })
  })

  it('should have unique IDs for all personas', () => {
    const ids = personas.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(personas.length)
  })

  it('should have unique slugs for all personas', () => {
    const slugs = personas.map((p) => p.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(personas.length)
  })

  it('should have valid survey URLs', () => {
    expect(SURVEY_URL).toMatch(/^https:\/\//)
    expect(SURVEY_URL).toContain('qualtrics.com')
    personas.forEach((persona) => {
      expect(persona.surveyUrl).toMatch(/^https:\/\//)
    })
  })

  it('should have non-empty descriptions', () => {
    personas.forEach((persona) => {
      expect(persona.description.length).toBeGreaterThan(50)
    })
  })

  it('should have non-empty titles and shortTitles', () => {
    personas.forEach((persona) => {
      expect(persona.title.length).toBeGreaterThan(0)
      expect(persona.shortTitle.length).toBeGreaterThan(0)
    })
  })
})
