import { renderReleaseNotesMarkdown } from '@/lib/release-notes'

describe('renderReleaseNotesMarkdown', () => {
  it('renders the expected v0.2.0-style headings', () => {
    const md = renderReleaseNotesMarkdown({
      tag: 'v0.2.1',
      dateISO: '2026-01-22',
      mainSummary: [],
      userFacingChanges: [],
      internalImprovements: [],
      integrations: {
        prolific: [],
        qualtrics: [],
        google: [],
        microsoft: [],
      },
      contributors: {
        humans: ['Jane Doe <jane@example.com>'],
        bots: ['dependabot[bot] <bot@example.com>'],
        aiTooling: ['GitHub Copilot Pro Plus', 'Google Gemini Ultimate'],
      },
      lessonsLearned: [],
      mergedPullRequests: [
        {
          number: 123,
          title: 'chore: update deps',
          url: 'https://github.com/org/repo/pull/123',
        },
      ],
      closedIssues: [
        {
          number: 456,
          title: 'Release template automation',
          url: 'https://github.com/org/repo/issues/456',
        },
      ],
      relatedIssueNumber: 159,
    })

    expect(md).toContain('## Main Summary')
    expect(md).toContain('## 1. User Facing Changes')
    expect(md).toContain('## 2. Internal Application Improvements')
    expect(md).toContain('## 3. External Integrations')
    expect(md).toContain('## Contributors')
    expect(md).toContain('## Lessons Learned')
    expect(md).toContain('## Merged pull requests (newest → oldest)')
    expect(md).toContain('## Closed issues included (newest → oldest)')

    expect(md).toContain('- [#123](https://github.com/org/repo/pull/123) - chore: update deps')
    expect(md).toContain(
      '- [#456](https://github.com/org/repo/issues/456) - Release template automation'
    )

    expect(md).toContain('- Issue: #159')
  })
})
