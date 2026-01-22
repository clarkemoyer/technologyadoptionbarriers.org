export type ReleaseNotesPullRequest = {
  number: number
  title: string
  url: string
}

export type ReleaseNotesIssue = {
  number: number
  title: string
  url: string
}

export type ReleaseNotesIntegrations = {
  prolific: string[]
  qualtrics: string[]
  google: string[]
  microsoft: string[]
}

export type ReleaseNotesContributors = {
  humans: string[]
  bots: string[]
  aiTooling: string[]
}

export type ReleaseNotesParams = {
  tag: string
  dateISO: string // YYYY-MM-DD
  mainSummary: string[]
  userFacingChanges: string[]
  internalImprovements: string[]
  integrations: ReleaseNotesIntegrations
  contributors: ReleaseNotesContributors
  lessonsLearned: string[]
  mergedPullRequests: ReleaseNotesPullRequest[]
  closedIssues: ReleaseNotesIssue[]
  relatedIssueNumber?: number
}

function renderBullets(items: string[], fallback: string[] = ['-', '-', '-']): string {
  const normalized = (items.length > 0 ? items : fallback).map((item) => item.trim())
  return normalized
    .map((item) => {
      if (item.length === 0 || item === '-') {
        return '-'
      }

      return `- ${item}`
    })
    .join('\n')
}

function renderLinks<T extends { number: number; title: string; url: string }>(items: T[]): string {
  if (items.length === 0) {
    return '- None in this release.'
  }

  return items.map((item) => `- [#${item.number}](${item.url}) - ${item.title}`).join('\n')
}

function renderIntegrationSection(title: string, items: string[]): string {
  const body = items.length === 0 ? ['None in this release.'] : items
  return `### ${title}\n\n${renderBullets(body, ['None in this release.'])}\n`
}

export function renderReleaseNotesMarkdown(params: ReleaseNotesParams): string {
  const date = params.dateISO

  return [
    `# ${params.tag} ${date}`,
    '## Main Summary\n',
    renderBullets(params.mainSummary),
    '\n\n## 1. User Facing Changes\n',
    renderBullets(params.userFacingChanges),
    '\n\n## 2. Internal Application Improvements\n',
    renderBullets(params.internalImprovements),
    '\n\n## 3. External Integrations\n',
    renderIntegrationSection('3.1 Prolific', params.integrations.prolific),
    renderIntegrationSection('3.2 Qualtrics', params.integrations.qualtrics),
    renderIntegrationSection('3.3 Google', params.integrations.google),
    renderIntegrationSection('3.4 Microsoft', params.integrations.microsoft),
    '## Contributors\n',
    '### Human contributors (commit authors)\n',
    renderBullets(params.contributors.humans, ['']),
    '\n\n### Automated commit authors (bots)\n',
    renderBullets(params.contributors.bots, ['']),
    '\n\n### AI / Tooling contributors\n',
    renderBullets(params.contributors.aiTooling, [
      'GitHub Copilot Pro Plus',
      'Google Gemini Ultimate',
    ]),
    '\n\n## Lessons Learned\n',
    renderBullets(params.lessonsLearned),
    '\n\n## Merged pull requests (newest → oldest)\n',
    renderLinks(params.mergedPullRequests),
    '\n\n## Closed issues included (newest → oldest)\n',
    renderLinks(params.closedIssues),
    '\n\n## Related\n',
    `- Issue: ${typeof params.relatedIssueNumber === 'number' ? `#${params.relatedIssueNumber}` : '#'}`,
    '',
  ].join('\n')
}
