import { slugify, normalizeQuotedTitle } from '../../src/lib/slugify'

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz')
  })

  it('strips leading and trailing whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello')
  })

  it('removes accents from characters', () => {
    expect(slugify('café')).toBe('cafe')
    expect(slugify('naïve')).toBe('naive')
  })

  it('collapses multiple non-alphanumeric sequences into a single hyphen', () => {
    expect(slugify('foo  --  bar')).toBe('foo-bar')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('--foo-bar--')).toBe('foo-bar')
  })

  it('handles numbers', () => {
    expect(slugify('Chapter 2: The Beginning')).toBe('chapter-2-the-beginning')
  })

  it('returns empty string for an all-special-character input', () => {
    expect(slugify('!@#$%')).toBe('')
  })
})

describe('normalizeQuotedTitle', () => {
  it('returns the title unchanged when it has no surrounding quotes', () => {
    expect(normalizeQuotedTitle('Hello World')).toBe('Hello World')
  })

  it('strips ASCII double quotes surrounding the title', () => {
    expect(normalizeQuotedTitle('"Hello World"')).toBe('Hello World')
  })

  it('strips Unicode curly/smart double quotes surrounding the title', () => {
    // \u201C = " (left double quotation mark)
    // \u201D = " (right double quotation mark)
    expect(normalizeQuotedTitle('\u201CHello World\u201D')).toBe('Hello World')
  })

  it('trims inner whitespace after stripping quotes', () => {
    expect(normalizeQuotedTitle('"  Hello World  "')).toBe('Hello World')
  })

  it('does not strip mismatched quotes', () => {
    // Opening ASCII " but closing curly " should NOT be stripped
    expect(normalizeQuotedTitle('"Hello World\u201D')).toBe('"Hello World\u201D')
  })

  it('trims outer whitespace before checking quotes', () => {
    expect(normalizeQuotedTitle('  "Hello"  ')).toBe('Hello')
  })
})
