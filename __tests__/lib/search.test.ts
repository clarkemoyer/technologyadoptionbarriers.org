import { search, highlightTerms, SearchDocument } from '@/lib/search'

describe('Search Library', () => {
  const mockDocuments: SearchDocument[] = [
    {
      id: '1',
      url: '/page1',
      title: 'Technology Adoption Barriers',
      description: 'Overview of technology adoption barriers',
      content:
        'This page explains various technology adoption barriers that organizations face when implementing new solutions.',
      category: 'Article',
    },
    {
      id: '2',
      url: '/page2',
      title: 'Organizational Change Management',
      description: 'How to manage organizational change',
      content:
        'Change management is crucial for successful technology adoption. Organizations need clear strategies.',
      category: 'Guide',
    },
    {
      id: '3',
      url: '/page3',
      title: 'Survey Results and Analysis',
      description: 'Results from our technology adoption survey',
      content:
        'Our survey collected responses from 500 organizations about technology adoption challenges.',
      category: 'Results',
    },
  ]

  describe('search()', () => {
    it('returns empty array for empty query', () => {
      const results = search(mockDocuments, '')
      expect(results).toEqual([])
    })

    it('returns matching documents', () => {
      const results = search(mockDocuments, 'technology')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].matchedFields).toContain('title')
    })

    it('prioritizes title matches over content matches', () => {
      const results = search(mockDocuments, 'technology')
      // First result should be the one with 'technology' in the title
      expect(results[0].document.title).toContain('Technology')
    })

    it('respects limit parameter', () => {
      const results = search(mockDocuments, 'technology', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('returns results sorted by relevance score', () => {
      const results = search(mockDocuments, 'technology adoption')
      if (results.length > 1) {
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score)
      }
    })

    it('handles partial word matches', () => {
      const results = search(mockDocuments, 'adopt')
      expect(results.length).toBeGreaterThan(0)
    })

    it('is case-insensitive', () => {
      const resultsLower = search(mockDocuments, 'technology')
      const resultsUpper = search(mockDocuments, 'TECHNOLOGY')
      expect(resultsLower.length).toBe(resultsUpper.length)
    })

    it('creates snippets from matching content', () => {
      const results = search(mockDocuments, 'adoption')
      expect(results[0].snippet).toBeTruthy()
      expect(results[0].snippet.length).toBeLessThan(300)
    })

    it('identifies matched fields correctly', () => {
      const results = search(mockDocuments, 'organizational change')
      const matched = results.find((r) => r.document.id === '2')
      if (matched) {
        expect(matched.matchedFields).toContain('title')
      }
    })
  })

  describe('highlightTerms()', () => {
    it('highlights matching terms in text', () => {
      const text = 'Technology adoption barriers'
      const highlighted = highlightTerms(text, 'technology')
      expect(highlighted).toContain('<mark>')
      expect(highlighted).toContain('</mark>')
    })

    it('is case-insensitive', () => {
      const text = 'Technology adoption'
      const highlighted = highlightTerms(text, 'TECHNOLOGY')
      expect(highlighted).toContain('<mark>')
    })

    it('handles multiple term highlighting', () => {
      const text = 'Technology adoption and change management'
      const highlighted = highlightTerms(text, 'technology adoption')
      const markedCount = (highlighted.match(/<mark>/g) || []).length
      expect(markedCount).toBeGreaterThan(0)
    })

    it('returns unchanged text for non-matching query', () => {
      const text = 'Some text content'
      const highlighted = highlightTerms(text, 'xyz')
      expect(highlighted).toBe(text)
    })

    it('returns original text for empty query', () => {
      const text = 'Some text'
      const highlighted = highlightTerms(text, '')
      expect(highlighted).toBe(text)
    })

    it('handles empty text input', () => {
      const highlighted = highlightTerms('', 'technology')
      expect(highlighted).toBe('')
    })

    it('HTML-escapes special characters to prevent XSS', () => {
      const text = '<script>alert("xss")</script>'
      const highlighted = highlightTerms(text, 'script')
      // Raw angle brackets must not appear in output
      expect(highlighted).not.toContain('<script>')
      expect(highlighted).not.toContain('</script>')
      // Entities must be present
      expect(highlighted).toContain('&lt;')
      expect(highlighted).toContain('&gt;')
    })

    it('HTML-escapes ampersands before other entities to avoid double-escaping', () => {
      const text = 'A&B and <tag>'
      const highlighted = highlightTerms(text, 'xyz')
      expect(highlighted).toContain('&amp;')
      expect(highlighted).toContain('&lt;')
      expect(highlighted).not.toContain('&&')
    })

    it('still highlights terms in text containing HTML characters', () => {
      const text = 'Tech & adoption <best> practices'
      const highlighted = highlightTerms(text, 'adoption')
      expect(highlighted).toContain('<mark>')
      expect(highlighted).toContain('</mark>')
      // Angle brackets from original text must be escaped
      expect(highlighted).toContain('&lt;')
      expect(highlighted).toContain('&gt;')
    })
  })

  describe('Edge cases', () => {
    it('handles special characters in search terms', () => {
      const results = search(mockDocuments, 'tech@nology')
      // Should still find results as special chars are stripped
      expect(Array.isArray(results)).toBe(true)
    })

    it('handles very long search queries', () => {
      const longQuery = 'a '.repeat(100)
      const results = search(mockDocuments, longQuery)
      expect(Array.isArray(results)).toBe(true)
    })

    it('handles whitespace-only queries', () => {
      const results = search(mockDocuments, '   ')
      expect(results).toEqual([])
    })

    it('handles single character query (returns an array)', () => {
      const results = search(mockDocuments, 'a')
      // Single chars should still work but may return broad results
      expect(Array.isArray(results)).toBe(true)
    })
  })
})
