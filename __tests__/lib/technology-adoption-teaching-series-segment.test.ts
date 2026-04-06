import {
  buildTeachingSeriesSlideId,
  buildTeachingSeriesSlideSegment,
} from '@/lib/technology-adoption-teaching-series-segment'

describe('technology-adoption-teaching-series-segment', () => {
  describe('buildTeachingSeriesSlideId', () => {
    it('pads single-digit numbers with a leading zero', () => {
      expect(buildTeachingSeriesSlideId(1)).toBe('slide-01')
      expect(buildTeachingSeriesSlideId(9)).toBe('slide-09')
    })

    it('does not pad multi-digit numbers', () => {
      expect(buildTeachingSeriesSlideId(10)).toBe('slide-10')
      expect(buildTeachingSeriesSlideId(99)).toBe('slide-99')
      expect(buildTeachingSeriesSlideId(100)).toBe('slide-100')
    })
  })

  describe('buildTeachingSeriesSlideSegment', () => {
    it('combines slide ID and slugified title', () => {
      expect(buildTeachingSeriesSlideSegment(1, 'Introduction')).toBe('slide-01-introduction')
      expect(buildTeachingSeriesSlideSegment(2, 'Complex Title Here')).toBe(
        'slide-02-complex-title-here'
      )
    })

    it('uses slide ID twice when title slugifies to an empty string', () => {
      // Empty string
      expect(buildTeachingSeriesSlideSegment(1, '')).toBe('slide-01-slide-01')
      // Only special characters
      expect(buildTeachingSeriesSlideSegment(2, '!@#$%^&*()')).toBe('slide-02-slide-02')
    })

    it('handles titles with special characters gracefully', () => {
      expect(buildTeachingSeriesSlideSegment(3, 'Slide with: punctuation!')).toBe(
        'slide-03-slide-with-punctuation'
      )
      // É decomposes via NFKD to E + combining acute (U+0301), which is stripped → 'e'
      // ø (U+00F8) does not decompose in NFKD and is not a combining diacritic, so it
      // is replaced by '-' as a non-[a-z0-9] character → 'm-re'
      expect(buildTeachingSeriesSlideSegment(4, 'Émphasis & Møre')).toBe('slide-04-emphasis-m-re')
    })
  })
})
