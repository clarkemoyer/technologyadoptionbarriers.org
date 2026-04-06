import { serializeJsonLd } from '../../src/lib/jsonLd'

describe('serializeJsonLd', () => {
  it('serializes a plain object to JSON', () => {
    const result = serializeJsonLd({ '@type': 'Organization', name: 'TABS' })
    expect(JSON.parse(result)).toEqual({ '@type': 'Organization', name: 'TABS' })
  })

  it('escapes < as \\u003c so </script> cannot break out of a script tag', () => {
    const result = serializeJsonLd({ text: '</script>' })
    // The raw < must not appear in the output
    expect(result).not.toContain('<')
    // The JSON still round-trips to the original value
    expect(JSON.parse(result).text).toBe('</script>')
  })

  it('escapes all < characters in deeply nested values', () => {
    const result = serializeJsonLd({ a: { b: '<nested>' } })
    expect(result).not.toContain('<')
    expect(JSON.parse(result)).toEqual({ a: { b: '<nested>' } })
  })

  it('handles values with no < characters without modification', () => {
    const input = { name: 'No angle brackets here' }
    expect(serializeJsonLd(input)).toBe(JSON.stringify(input))
  })
})
