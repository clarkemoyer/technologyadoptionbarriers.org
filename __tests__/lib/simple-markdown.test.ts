import { parseSimpleMarkdown } from '@/lib/simple-markdown'

describe('parseSimpleMarkdown', () => {
  it('nests unindented "o" sub-bullets under a preceding colon item', () => {
    const markdown = [
      '• Downstream Development Decisions:',
      'o Must maintain backward compatibility',
      'o CI/CD must handle compiled artifacts',
      'Option 2: Cloud Native greenfield',
    ].join('\n')

    const nodes = parseSimpleMarkdown(markdown)

    expect(nodes[0]?.type).toBe('ul')
    if (nodes[0]?.type !== 'ul') throw new Error('Expected ul node')

    expect(nodes[0].items).toHaveLength(1)
    const parent = nodes[0].items[0]
    expect(parent.text).toBe('Downstream Development Decisions:')

    expect(parent.children?.[0]?.type).toBe('ul')
    const childList = parent.children?.[0]
    if (!childList || childList.type !== 'ul') throw new Error('Expected nested ul')

    expect(childList.items.map((i) => i.text)).toEqual([
      'Must maintain backward compatibility',
      'CI/CD must handle compiled artifacts',
    ])
  })

  it('nests indented dash bullets under ordered list items', () => {
    const markdown = [
      '1. Organizational Adoption',
      '   - Organization deploys and makes available',
      '',
      '2. User Adoption',
      '   - Voluntary: Users choose to use it',
    ].join('\n')

    const nodes = parseSimpleMarkdown(markdown)

    expect(nodes[0]?.type).toBe('ol')
    if (nodes[0]?.type !== 'ol') throw new Error('Expected ol node')

    expect(nodes[0].items).toHaveLength(2)
    expect(nodes[0].items[0].text).toBe('Organizational Adoption')

    const firstChildren = nodes[0].items[0].children
    expect(firstChildren?.[0]?.type).toBe('ul')
    const firstUl = firstChildren?.[0]
    if (!firstUl || firstUl.type !== 'ul') throw new Error('Expected nested ul')

    expect(firstUl.items[0].text).toBe('Organization deploys and makes available')
  })
})
