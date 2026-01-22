import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  renderReleaseNotesMarkdown,
  type ReleaseNotesIssue,
  type ReleaseNotesPullRequest,
} from '../src/lib/release-notes'

type Args = {
  from: string
  to: string
  tag: string
  dateISO: string
  repo?: string
  out?: string
  relatedIssue?: number
}

function run(command: string, args: string[]): string {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = {
    to: 'HEAD',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]

    if (arg === '--from' && next) {
      args.from = next
      i += 1
      continue
    }

    if (arg === '--to' && next) {
      args.to = next
      i += 1
      continue
    }

    if (arg === '--tag' && next) {
      args.tag = next
      i += 1
      continue
    }

    if (arg === '--date' && next) {
      args.dateISO = next
      i += 1
      continue
    }

    if (arg === '--repo' && next) {
      args.repo = next
      i += 1
      continue
    }

    if (arg === '--out' && next) {
      args.out = next
      i += 1
      continue
    }

    if (arg === '--issue' && next) {
      args.relatedIssue = Number(next)
      i += 1
      continue
    }

    if (arg === '--help') {
      throw new Error(
        [
          'Usage:',
          '  npx tsx scripts/generate-release-notes.ts --from v0.2.0 --tag v0.2.1 [--to HEAD] [--date YYYY-MM-DD] [--repo owner/name] [--out path] [--issue 159]',
          '',
          'Notes:',
          '  - Requires git + GitHub CLI (gh) to be installed and authenticated.',
          '  - Merged PRs + closed issues are pulled from GitHub using the merged/closed date range derived from the git refs.',
        ].join('\n')
      )
    }
  }

  if (!args.from) {
    throw new Error('Missing required flag: --from')
  }

  if (!args.tag) {
    throw new Error('Missing required flag: --tag')
  }

  if (!args.dateISO) {
    const now = new Date()
    args.dateISO = now.toISOString().slice(0, 10)
  }

  return args as Args
}

function getRepo(args: Args): string {
  if (args.repo) {
    return args.repo
  }

  const envRepo = process.env.GITHUB_REPOSITORY
  if (envRepo && envRepo.includes('/')) {
    return envRepo
  }

  // Fallback: ask gh what repo we're in.
  return run('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'])
}

function getRefCommitISO(ref: string): string {
  return run('git', ['show', '-s', '--format=%cI', ref])
}

function toDateOnly(iso: string): string {
  // GitHub search operates on dates (not datetimes). Always derive the date in UTC
  // so refs with a timezone offset don't truncate to the previous/next day.
  return new Date(iso).toISOString().slice(0, 10)
}

function listCommitAuthors(from: string, to: string): { humans: string[]; bots: string[] } {
  // We use %aN/%aE so it's stable across merges.
  const raw = run('git', ['log', `${from}..${to}`, '--format=%aN <%aE>'])

  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const unique = Array.from(new Set(lines))

  const bots: string[] = []
  const humans: string[] = []

  for (const author of unique) {
    if (author.includes('[bot]') || author.toLowerCase().includes('bot@')) {
      bots.push(author)
    } else {
      humans.push(author)
    }
  }

  humans.sort((a, b) => a.localeCompare(b))
  bots.sort((a, b) => a.localeCompare(b))

  return { humans, bots }
}

function listMergedPRs(repo: string, startISO: string, endISO: string): ReleaseNotesPullRequest[] {
  const search = `merged:>=${toDateOnly(startISO)} merged:<=${toDateOnly(endISO)}`

  const json = run('gh', [
    'pr',
    'list',
    '--repo',
    repo,
    '--state',
    'merged',
    '--limit',
    '200',
    '--search',
    search,
    '--json',
    'number,title,url,mergedAt',
  ])

  const parsed = JSON.parse(json) as Array<{
    number: number
    title: string
    url: string
    mergedAt: string
  }>

  const start = new Date(startISO).getTime()
  const end = new Date(endISO).getTime()

  const filtered = parsed
    .filter((pr) => {
      const merged = new Date(pr.mergedAt).getTime()
      // We want (from..to], not [from..to].
      return merged > start && merged <= end
    })
    .sort((a, b) => new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime())

  return filtered.map((pr) => ({ number: pr.number, title: pr.title, url: pr.url }))
}

function listClosedIssues(repo: string, startISO: string, endISO: string): ReleaseNotesIssue[] {
  const search = `closed:>=${toDateOnly(startISO)} closed:<=${toDateOnly(endISO)}`

  const json = run('gh', [
    'issue',
    'list',
    '--repo',
    repo,
    '--state',
    'closed',
    '--limit',
    '200',
    '--search',
    search,
    '--json',
    'number,title,url,closedAt',
  ])

  const parsed = JSON.parse(json) as Array<{
    number: number
    title: string
    url: string
    closedAt: string
  }>

  const start = new Date(startISO).getTime()
  const end = new Date(endISO).getTime()

  const filtered = parsed
    .filter((issue) => {
      const closed = new Date(issue.closedAt).getTime()
      // We want (from..to], not [from..to].
      return closed > start && closed <= end
    })
    .sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())

  return filtered.map((issue) => ({ number: issue.number, title: issue.title, url: issue.url }))
}

function ensureOutDir(filePath: string): void {
  const dir = path.dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const repo = getRepo(args)

  const startISO = getRefCommitISO(args.from)
  const endISO = getRefCommitISO(args.to)

  const authors = listCommitAuthors(args.from, args.to)
  const mergedPRs = listMergedPRs(repo, startISO, endISO)
  const closedIssues = listClosedIssues(repo, startISO, endISO)

  const markdown = renderReleaseNotesMarkdown({
    tag: args.tag,
    dateISO: args.dateISO,
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
      humans: authors.humans,
      bots: authors.bots,
      aiTooling: ['GitHub Copilot Pro Plus', 'Google Gemini Ultimate'],
    },
    lessonsLearned: [],
    mergedPullRequests: mergedPRs,
    closedIssues,
    relatedIssueNumber: args.relatedIssue,
  })

  if (args.out) {
    ensureOutDir(args.out)
    writeFileSync(args.out, markdown, 'utf8')
    return
  }

  console.log(markdown)
}

main()
