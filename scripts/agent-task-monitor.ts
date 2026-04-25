/**
 * Agent Task Monitor
 *
 * Lists GitHub Copilot agent tasks (open issues assigned to `copilot`),
 * flags stalled tasks (no activity in the last 24 hours), and flags tasks
 * with failed CI (when the task has an associated PR).
 *
 * Uses `gh agent-task list` when available (gh CLI ≥ 2.67), falling back
 * to the GitHub Issues REST API for older CLI versions.
 *
 * Environment variables:
 *   GH_TOKEN     – GitHub personal access token (required)
 *   REPO_NAME    – owner/repo slug (defaults to GITHUB_REPOSITORY)
 *   STALE_HOURS  – hours of inactivity before a task is "stalled" (default: 24)
 *   RETRIGGER    – "true" to re-trigger stalled tasks by re-assigning copilot
 *   TARGET_ISSUE – issue number to process exclusively when re-running/debugging
 *   DRY_RUN      – "true" to report findings without performing write operations
 */

import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'

// ── Configuration ──────────────────────────────────────────────────────────

const _staleHoursParsed = parseInt(process.env.STALE_HOURS || '24', 10)
const STALE_HOURS = Number.isFinite(_staleHoursParsed) ? Math.max(1, _staleHoursParsed) : 24
const REPO = process.env.REPO_NAME || process.env.GITHUB_REPOSITORY || ''
const RETRIGGER = process.env.RETRIGGER === 'true'
/** When set, only process the single issue with this number. */
const _targetIssueParsed = process.env.TARGET_ISSUE ? parseInt(process.env.TARGET_ISSUE, 10) : null
const TARGET_ISSUE =
  _targetIssueParsed !== null && Number.isFinite(_targetIssueParsed) ? _targetIssueParsed : null
/** When true, report findings without performing any write operations. */
const DRY_RUN = process.env.DRY_RUN === 'true'

// ── Types ──────────────────────────────────────────────────────────────────

interface AgentTask {
  number: number
  title: string
  url: string
  updatedAt: string
  createdAt: string
  state: string
  assignees: string[]
  labels: string[]
  body: string
}

interface PrStatus {
  prNumber: number
  prUrl: string
  ciStatus: 'pass' | 'fail' | 'pending' | 'unknown'
  headSha: string
}

interface TaskReport {
  task: AgentTask
  stalled: boolean
  idleHours: number
  prStatus: PrStatus | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

function gh(args: string): string {
  try {
    return execSync(`gh ${args}`, {
      encoding: 'utf-8',
      env: { ...process.env, GH_TOKEN: process.env.GH_TOKEN },
      timeout: 60_000,
    }).trim()
  } catch (err: unknown) {
    const e = err as { stderr?: unknown; message?: string }
    throw new Error(
      (e.stderr != null ? String(e.stderr) : null) || e.message || 'gh command failed'
    )
  }
}

function ghJson<T>(args: string): T {
  return JSON.parse(gh(args))
}

function ghJsonArray<T>(args: string): T[] {
  const raw = gh(args)
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return [parsed]
  } catch {
    // --paginate emits multiple JSON arrays concatenated: [...][...]
    const fixed = '[' + raw.replace(/\]\s*\[/g, ',') + ']'
    try {
      const outer = JSON.parse(fixed)
      return Array.isArray(outer[0]) ? outer.flat() : outer
    } catch {
      return []
    }
  }
}

function idleHours(updatedAt: string): number {
  return (Date.now() - new Date(updatedAt).getTime()) / (60 * 60 * 1000)
}

// ── Agent-task listing ─────────────────────────────────────────────────────

/**
 * Try `gh agent-task list` (available in gh CLI ≥ 2.67).
 * Returns null if the command is not available or if the current git context
 * does not match REPO (to avoid mixing tasks from one repo with API calls
 * targeting another).
 */
function tryAgentTaskList(): AgentTask[] | null {
  try {
    // Verify the git repo inferred by gh matches REPO before relying on it.
    // If they differ, fall through to the Issues API which always targets REPO
    // explicitly via the URL path.
    let currentRepo: string
    try {
      currentRepo = gh('repo view --json nameWithOwner --jq .nameWithOwner')
    } catch {
      return null
    }
    if (currentRepo.toLowerCase() !== REPO.toLowerCase()) {
      console.warn(
        `  ⚠ git context is "${currentRepo}" but REPO is "${REPO}" - skipping gh agent-task list`
      )
      return null
    }

    const raw = gh(`agent-task list --json number,title,url,updatedAt,createdAt,state`)
    const items = JSON.parse(raw)
    if (!Array.isArray(items)) return null
    return items.map((item: any) => ({
      number: item.number,
      title: item.title ?? '',
      url: item.url ?? '',
      updatedAt: item.updatedAt ?? item.updated_at ?? new Date().toISOString(),
      createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
      state: item.state ?? 'open',
      assignees: (item.assignees ?? []).map((a: any) => a.login ?? a),
      labels: (item.labels ?? []).map((l: any) => l.name ?? l),
      body: item.body ?? '',
    }))
  } catch {
    return null
  }
}

/**
 * Fall back to the GitHub Issues API to list open issues assigned to
 * `copilot` (the Copilot coding agent's login).
 */
function listViaIssuesApi(): AgentTask[] {
  console.log('  (gh agent-task not available - using Issues API fallback)')
  const raw = ghJsonArray<any>(
    `api "repos/${REPO}/issues?assignee=copilot&state=open&per_page=100" --paginate`
  )
  return raw
    .filter((issue: any) => !issue.pull_request)
    .map((issue: any) => ({
      number: issue.number,
      title: issue.title ?? '',
      url: issue.html_url ?? '',
      updatedAt: issue.updated_at ?? new Date().toISOString(),
      createdAt: issue.created_at ?? new Date().toISOString(),
      state: issue.state ?? 'open',
      assignees: (issue.assignees ?? []).map((a: any) => a.login),
      labels: (issue.labels ?? []).map((l: any) => l.name),
      body: issue.body ?? '',
    }))
}

function listAgentTasks(): AgentTask[] {
  console.log(`Listing Copilot agent tasks for ${REPO}...`)
  const fromCli = tryAgentTaskList()
  if (fromCli !== null) {
    console.log(`  Found ${fromCli.length} task(s) via gh agent-task list.`)
    return fromCli
  }
  const fromApi = listViaIssuesApi()
  console.log(`  Found ${fromApi.length} task(s) via Issues API.`)
  return fromApi
}

// ── CI status ──────────────────────────────────────────────────────────────

/**
 * Find the most recent open PR whose body references the given issue number
 * (common patterns: "Closes #N", "Fixes #N", "Part of #N").
 */
function findAssociatedPr(issueNumber: number): PrStatus | null {
  try {
    // Search for PRs that use explicit issue reference tokens in the body.
    // Avoid searching for the bare issue number, which can match unrelated
    // dates, version numbers, and other numeric text.
    const referenceTokens = [
      `#${issueNumber}`,
      `close #${issueNumber}`,
      `closes #${issueNumber}`,
      `closed #${issueNumber}`,
      `fix #${issueNumber}`,
      `fixes #${issueNumber}`,
      `fixed #${issueNumber}`,
      `resolve #${issueNumber}`,
      `resolves #${issueNumber}`,
      `resolved #${issueNumber}`,
      `part of #${issueNumber}`,
      `refs #${issueNumber}`,
      `references #${issueNumber}`,
    ]

    const prMap = new Map<number, any>()
    for (const token of referenceTokens) {
      const query = `repo:${REPO} is:pr is:open "${token}" in:body`
      try {
        const results = ghJson<{ items: any[] }>(
          `api "search/issues?q=${encodeURIComponent(query)}&per_page=5"`
        )
        for (const item of results.items ?? []) {
          if (item.pull_request && typeof item.number === 'number' && !prMap.has(item.number)) {
            prMap.set(item.number, item)
          }
        }
      } catch {
        // ignore per-token search failures; continue to next token
      }
    }

    const prs = Array.from(prMap.values())
    if (prs.length === 0) return null

    // Pick the most recently updated PR
    prs.sort(
      (a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    const pr = prs[0]
    const prNumber = pr.number

    // Get head SHA for CI check
    const prDetail = ghJson<any>(`api repos/${REPO}/pulls/${prNumber}`)
    const headSha = prDetail.head?.sha ?? ''
    const prUrl = prDetail.html_url ?? pr.html_url ?? ''

    // Check combined commit status
    const ciStatus = getCiStatus(REPO, headSha)
    return { prNumber, prUrl, ciStatus, headSha }
  } catch {
    return null
  }
}

function getCiStatus(repo: string, headSha: string): 'pass' | 'fail' | 'pending' | 'unknown' {
  if (!headSha) return 'unknown'
  try {
    // Combined status (legacy CI)
    const status = ghJson<any>(`api repos/${repo}/commits/${headSha}/status`)
    if (status.state === 'success') return 'pass'
    if (status.state === 'failure' || status.state === 'error') return 'fail'
    if (status.state === 'pending') return 'pending'
  } catch {
    // ignore - may not have legacy status
  }
  try {
    // Check runs (modern CI)
    const runs = ghJson<any>(`api repos/${repo}/commits/${headSha}/check-runs?per_page=100`)
    const checkRuns: any[] = runs.check_runs ?? []
    if (checkRuns.length === 0) return 'unknown'

    const pending = checkRuns.filter((r: any) => r.status !== 'completed')
    if (pending.length > 0) return 'pending'

    const passingConclusions = new Set(['success', 'neutral', 'skipped'])
    const failingConclusions = new Set([
      'failure',
      'timed_out',
      'cancelled',
      'action_required',
      'startup_failure',
    ])

    for (const run of checkRuns) {
      const conclusion = run.conclusion
      if (failingConclusions.has(conclusion)) return 'fail'
      if (!passingConclusions.has(conclusion)) return 'unknown'
    }
    return 'pass'
  } catch {
    return 'unknown'
  }
}

// ── Re-trigger ─────────────────────────────────────────────────────────────

/**
 * Re-trigger a stalled Copilot agent task by removing and re-adding the
 * `copilot` assignee. This causes GitHub to restart the agent session.
 * No-op when DRY_RUN is true.
 */
function retriggerTask(task: AgentTask): void {
  if (DRY_RUN) {
    console.log(`  [dry-run] Would retrigger task #${task.number}.`)
    return
  }
  console.log(`  Re-triggering task #${task.number}...`)
  const tmpFile = join(tmpdir(), `agent-task-retrigger-${task.number}-${Date.now()}.md`)
  try {
    // Remove copilot assignee
    gh(`api repos/${REPO}/issues/${task.number}/assignees -X DELETE -f "assignees[]=copilot"`)
    // Re-add copilot assignee to trigger a new agent session
    gh(`api repos/${REPO}/issues/${task.number}/assignees -X POST -f "assignees[]=copilot"`)
    // Add a comment so the history is clear - write body to temp file to avoid shell escaping issues
    const body =
      `**Agent Task Monitor:** This task was automatically re-triggered because ` +
      `no activity was detected for more than ${STALE_HOURS} hours. ` +
      `Copilot has been re-assigned to resume work.`
    writeFileSync(tmpFile, body, 'utf-8')
    gh(`issue comment ${task.number} -R ${REPO} --body-file "${tmpFile}"`)
    console.log(`  ✓ Re-triggered #${task.number}.`)
  } catch (err: any) {
    console.warn(`  ⚠ Could not re-trigger #${task.number}: ${err.message?.slice(0, 200)}`)
  } finally {
    try {
      unlinkSync(tmpFile)
    } catch {
      // ignore cleanup errors
    }
  }
}

// ── Reporting ──────────────────────────────────────────────────────────────

function ciEmoji(status: 'pass' | 'fail' | 'pending' | 'unknown'): string {
  return { pass: '✅', fail: '❌', pending: '⏳', unknown: '❓' }[status]
}

/** Render a task's issue number as a Markdown link. */
function issueCell(task: AgentTask): string {
  return `[#${task.number}](${task.url})`
}

/** Render a PR status as a Markdown link (or dash if no PR). */
function prCell(prStatus: PrStatus | null): string {
  return prStatus ? `[#${prStatus.prNumber}](${prStatus.prUrl})` : '-'
}

/** Render CI status as an emoji + label (or dash if no PR). */
function ciCell(prStatus: PrStatus | null): string {
  return prStatus ? `${ciEmoji(prStatus.ciStatus)} ${prStatus.ciStatus}` : '-'
}

function buildReport(reports: TaskReport[]): string {
  const now = new Date().toUTCString()
  const stalled = reports.filter((r) => r.stalled)
  const ciFailures = reports.filter((r) => r.prStatus?.ciStatus === 'fail')
  const healthy = reports.filter((r) => !r.stalled && r.prStatus?.ciStatus !== 'fail')

  const lines: string[] = [
    `# 🤖 Copilot Agent Task Monitor`,
    ``,
    `**Repo:** \`${REPO}\` | **Checked:** ${now} | **Stale threshold:** ${STALE_HOURS}h`,
    ``,
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total tasks | ${reports.length} |`,
    `| ⚠️ Stalled (>${STALE_HOURS}h idle) | ${stalled.length} |`,
    `| ❌ CI failing | ${ciFailures.length} |`,
    `| ✅ Healthy | ${healthy.length} |`,
    ``,
  ]

  if (reports.length === 0) {
    lines.push(`_No open Copilot agent tasks found._`)
    return lines.join('\n')
  }

  // ── Stalled tasks ──
  if (stalled.length > 0) {
    lines.push(`## ⚠️ Stalled Tasks (no activity in ${STALE_HOURS}h)`, ``)
    lines.push(`| Issue | Title | Idle | CI | PR |`)
    lines.push(`|-------|-------|------|----|-----|`)
    for (const { task, idleHours: idle, prStatus } of stalled) {
      lines.push(
        `| ${issueCell(task)} | ${mdEscape(task.title)} | ${idle.toFixed(1)}h | ${ciCell(prStatus)} | ${prCell(prStatus)} |`
      )
    }
    lines.push(``)
  }

  // ── CI failures ──
  if (ciFailures.length > 0) {
    lines.push(`## ❌ Tasks with Failing CI`, ``)
    lines.push(`| Issue | Title | PR | Idle |`)
    lines.push(`|-------|-------|-----|------|`)
    for (const { task, idleHours: idle, prStatus } of ciFailures) {
      lines.push(
        `| ${issueCell(task)} | ${mdEscape(task.title)} | ${prCell(prStatus)} | ${idle.toFixed(1)}h |`
      )
    }
    lines.push(``)
  }

  // ── All tasks ──
  lines.push(`## 📋 All Agent Tasks`, ``)
  lines.push(`| Issue | Title | Idle | CI | PR | Status |`)
  lines.push(`|-------|-------|------|----|-----|--------|`)
  for (const { task, stalled: isStalled, idleHours: idle, prStatus } of reports) {
    const status = isStalled ? '⚠️ stalled' : prStatus?.ciStatus === 'fail' ? '❌ CI fail' : '✅ ok'
    lines.push(
      `| ${issueCell(task)} | ${mdEscape(task.title)} | ${idle.toFixed(1)}h | ${ciCell(prStatus)} | ${prCell(prStatus)} | ${status} |`
    )
  }

  return lines.join('\n')
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (!REPO) {
    console.error('Missing required env: REPO_NAME or GITHUB_REPOSITORY')
    process.exit(1)
  }
  if (!process.env.GH_TOKEN) {
    console.error('Missing required env: GH_TOKEN')
    process.exit(1)
  }

  console.log(`\n=== Copilot Agent Task Monitor for ${REPO} ===\n`)
  console.log(`Stale threshold: ${STALE_HOURS} hours`)
  console.log(`Re-trigger stalled: ${RETRIGGER}`)
  console.log(`Dry run: ${DRY_RUN}`)
  if (TARGET_ISSUE) console.log(`Target issue: #${TARGET_ISSUE}`)
  console.log('')

  let tasks = listAgentTasks()

  // Filter to a single issue when requested (e.g., manual retrigger of one task)
  if (TARGET_ISSUE !== null) {
    tasks = tasks.filter((t) => t.number === TARGET_ISSUE)
    if (tasks.length === 0) {
      console.warn(`Issue #${TARGET_ISSUE} is not an open Copilot agent task.`)
      process.exit(0)
    }
  }

  if (tasks.length === 0) {
    console.log('No open Copilot agent tasks found.')
    appendGithubStepSummary(
      `# 🤖 Copilot Agent Task Monitor\n\n_No open Copilot agent tasks found for \`${REPO}\`._\n`
    )
    return
  }

  console.log(`\nAnalyzing ${tasks.length} task(s)...\n`)

  const reports: TaskReport[] = []

  for (const task of tasks) {
    const idle = idleHours(task.updatedAt)
    const isStalled = idle >= STALE_HOURS
    console.log(
      `  #${task.number} "${task.title.slice(0, 60)}" - idle: ${idle.toFixed(1)}h${isStalled ? ' ⚠️ STALLED' : ''}`
    )

    // Find associated PR and check CI
    let prStatus: PrStatus | null = null
    try {
      prStatus = findAssociatedPr(task.number)
      if (prStatus) {
        console.log(
          `    PR #${prStatus.prNumber}: CI ${prStatus.ciStatus}${prStatus.ciStatus === 'fail' ? ' ❌' : ''}`
        )
      }
    } catch {
      // non-fatal
    }

    // Re-trigger stalled tasks if requested
    if (isStalled && RETRIGGER) {
      retriggerTask(task)
    }

    reports.push({ task, stalled: isStalled, idleHours: idle, prStatus })
  }

  // ── Summary ──
  const stalled = reports.filter((r) => r.stalled)
  const ciFailures = reports.filter((r) => r.prStatus?.ciStatus === 'fail')

  console.log(`\n=== Summary ===`)
  console.log(`Total tasks:  ${reports.length}`)
  console.log(`Stalled:      ${stalled.length}`)
  console.log(`CI failures:  ${ciFailures.length}`)

  // ── Step summary ──
  const md = buildReport(reports)
  appendGithubStepSummary(md)

  // ── Exit code: non-zero if any issues found ──
  if (stalled.length > 0 || ciFailures.length > 0) {
    console.log(
      `\n⚠️ Found ${stalled.length} stalled task(s) and ${ciFailures.length} CI failure(s).`
    )
    process.exit(1)
  }

  console.log('\n✅ All agent tasks are healthy.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
