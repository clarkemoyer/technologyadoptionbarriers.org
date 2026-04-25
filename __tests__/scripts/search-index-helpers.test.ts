import {
  endsWithTerminalPunctuation,
  extractStaticMetadata,
  joinSegments,
} from '../../scripts/generate-search-index'

describe('endsWithTerminalPunctuation', () => {
  it.each([
    [true, 'Hello.'],
    [true, 'Hello!'],
    [true, 'Hello?'],
    [true, 'Title:'],
    [true, 'List;'],
    [true, 'Dash—'],
    [true, 'Range–'],
  ])('returns %s for %p (basic terminal punctuation)', (expected, input) => {
    expect(endsWithTerminalPunctuation(input)).toBe(expected)
  })

  it.each([
    [true, 'Hello!"'],
    [true, 'Hello!)'],
    [true, 'Done.]'],
    [true, "Hello!'"],
    [true, 'End.}'],
    [true, 'Finish?)"'],
    [true, 'Hello!\u201D'],
    [true, 'Hello!\u2019'],
    [true, 'End.\u00BB'],
  ])('returns %s for %p (terminal punctuation with trailing closers)', (expected, input) => {
    expect(endsWithTerminalPunctuation(input)).toBe(expected)
  })

  it.each([
    [false, 'Hello'],
    [false, 'U.S.A'],
    [false, ''],
    [false, '(TABS)'],
    [false, 'word'],
    [false, 'Hyphen-'],
  ])('returns %s for %p (no terminal punctuation)', (expected, input) => {
    expect(endsWithTerminalPunctuation(input)).toBe(expected)
  })

  it('ignores trailing whitespace', () => {
    expect(endsWithTerminalPunctuation('Hello.  ')).toBe(true)
    expect(endsWithTerminalPunctuation('Hello   ')).toBe(false)
  })

  it('preserves abbreviation-ending periods (e.g. U.S.)', () => {
    // "U.S." ends with a period so it counts as terminal punctuation
    expect(endsWithTerminalPunctuation('U.S.')).toBe(true)
  })
})

describe('joinSegments', () => {
  it('returns empty string for empty array', () => {
    expect(joinSegments([])).toBe('')
  })

  it('returns the single segment trimmed', () => {
    expect(joinSegments(['  Hello  '])).toBe('Hello')
  })

  it('joins two plain segments with ". "', () => {
    expect(joinSegments(['Title', 'Description'])).toBe('Title. Description')
  })

  it('joins three plain segments with ". "', () => {
    expect(joinSegments(['Title', 'Description', 'Body text'])).toBe(
      'Title. Description. Body text'
    )
  })

  it('uses " " when first segment ends with a period', () => {
    expect(joinSegments(['Hello.', 'World'])).toBe('Hello. World')
  })

  it('avoids double-period artifacts like "(TABS).."', () => {
    expect(joinSegments(['(TABS).', 'More text'])).toBe('(TABS). More text')
  })

  it('handles trailing closers after punctuation', () => {
    expect(joinSegments(['Hello!"', 'Next'])).toBe('Hello!" Next')
  })

  it('handles colons as terminal punctuation', () => {
    expect(joinSegments(['Overview:', 'Details'])).toBe('Overview: Details')
  })

  it('handles semicolons as terminal punctuation', () => {
    expect(joinSegments(['First;', 'Second'])).toBe('First; Second')
  })

  it('handles em-dashes as terminal punctuation', () => {
    expect(joinSegments(['Intro—', 'Body'])).toBe('Intro— Body')
  })

  it('collapses internal whitespace', () => {
    expect(joinSegments(['Hello   world', 'Foo   bar'])).toBe('Hello world. Foo bar')
  })

  it('trims leading/trailing whitespace from segments', () => {
    expect(joinSegments(['  Title  ', '  Desc  '])).toBe('Title. Desc')
  })

  it('filters out empty segments', () => {
    expect(joinSegments(['', 'Title', '', 'Desc', ''])).toBe('Title. Desc')
  })

  it('filters out whitespace-only segments', () => {
    expect(joinSegments(['   ', 'Title', '  ', 'Desc'])).toBe('Title. Desc')
  })

  it('does not produce leading separator when first segment is empty', () => {
    expect(joinSegments(['', '', 'Hello'])).toBe('Hello')
  })
})

describe('extractStaticMetadata', () => {
  it('returns robotsIndexFalse=false when there is no export const metadata block', () => {
    const result = extractStaticMetadata('export default function Page() { return null }')
    expect(result).toEqual({ title: null, description: null, robotsIndexFalse: false })
  })

  it('returns robotsIndexFalse=false when metadata has no robots field', () => {
    const source = `
      export const metadata = {
        title: 'A Page',
        description: 'Some description',
      }
    `
    const result = extractStaticMetadata(source)
    expect(result.robotsIndexFalse).toBe(false)
    expect(result.title).toBe('A Page')
    expect(result.description).toBe('Some description')
  })

  it('returns robotsIndexFalse=true when metadata declares robots: { index: false }', () => {
    const source = `
      export const metadata = {
        title: 'Redirect Page',
        description: 'Server-side redirect stub',
        robots: { index: false, follow: false },
      }
    `
    expect(extractStaticMetadata(source).robotsIndexFalse).toBe(true)
  })

  it('returns robotsIndexFalse=false when robots.index is true', () => {
    const source = `
      export const metadata = {
        title: 'Normal Page',
        robots: { index: true, follow: true },
      }
    `
    expect(extractStaticMetadata(source).robotsIndexFalse).toBe(false)
  })

  it('returns robotsIndexFalse=true when metadata is typed with Metadata annotation', () => {
    // Real page files declare `: Metadata` - make sure the regex still finds the block.
    const source = `
      import type { Metadata } from 'next'
      export const metadata: Metadata = {
        robots: { index: false },
      }
    `
    expect(extractStaticMetadata(source).robotsIndexFalse).toBe(true)
  })
})
