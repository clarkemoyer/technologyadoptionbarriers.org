import { endsWithTerminalPunctuation, joinSegments } from '../../scripts/generate-search-index'

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
