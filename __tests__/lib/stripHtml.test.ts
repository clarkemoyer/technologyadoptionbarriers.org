import { stripHtml } from '../../src/lib/stripHtml'

describe('stripHtml', () => {
  it('returns empty string for empty/whitespace input', () => {
    expect(stripHtml('')).toBe('')
    expect(stripHtml('   ')).toBe('')
  })

  it('removes simple tags and normalizes whitespace', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello')
    expect(stripHtml('<div>Hello <b>world</b></div>')).toBe('Hello world')
  })

  it('handles nested tags and multiple spaces', () => {
    expect(stripHtml('<p>Hello <span>nested <em>tags</em></span></p>')).toBe('Hello nested tags')
    expect(stripHtml('<p>Hello</p>    <p>world</p>')).toBe('Hello world')
  })

  it('is resilient to malformed html-ish text', () => {
    expect(stripHtml('Hello <b>world')).toBe('Hello world')
    expect(stripHtml('Hello < not a tag > world')).toBe('Hello world')
  })
})
