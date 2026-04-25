import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'

// --- Configuration ---
const REVIEW_POLL_INTERVAL_MS = 20_000
const REVIEW_TIMEOUT_MS = 15 * 60 * 1000
const FIX_POLL_INTERVAL_MS = 30_000
const FIX_TIMEOUT_MS = 20 * 60 * 1000
const CI_POLL_INTERVAL_MS = 30_000
const CI_TIMEOUT_MS = (() => {
  const raw = process.env.CI_TIMEOUT_MS?.trim()
  const val = raw ? Number(raw) : NaN
  return val > 0 ? val : 30 * 60 * 1000
})()
const MAX_RETRIES = 3

// --- Types ---
interface PrState {
  state: string
  isDraft: boolean
  headRefOid: string
  headRefName: string
}

interface Review {
  id: number
  state: string
  user: { login: string }
  submitted_at: string
  body: string
}

interface ReviewComment {
  id: number
  path: string
  line: number | null
  body: string
}

interface ReviewThread {
  id: string // GraphQL node ID
  isResolved: boolean
  comments: { nodes: Array<{ databaseId: number; author: { login: string } | null }> }
}

// --- Helpers ---
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function gh(args: string, retries = MAX_RETRIES): string {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return execSync(`gh ${args}`, {
        encoding: 'utf-8',
        env: { ...process.env, GH_TOKEN: process.env.GH_TOKEN },
        timeout: 60_000,
      }).trim()
    } catch (error: any) {
      const msg = error.stderr?.toString() || error.message || ''
      if (
        attempt < retries &&
        (msg.includes('502') || msg.includes('503') || msg.includes('rate'))
      ) {
        const delayMs = 1000 * Math.pow(2, attempt)
        console.log(`  Retry ${attempt}/${retries} after ${delayMs}ms...`)
        const start = Date.now()
        while (Date.now() - start < delayMs) {
          // busy-wait - avoids shell sleep dependency
        }
        continue
      }
      throw error
    }
  }
  throw new Error('Unreachable')
}

/**
 * Parse JSON from gh api output, handling --paginate which may emit
 * multiple JSON arrays (one per page) concatenated together.
 */
function ghJsonArray<T>(args: string): T[] {
  const raw = gh(args)
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return [parsed]
  } catch {
    // --paginate emits multiple JSON arrays: [...][...] - wrap and merge
    const fixed = '[' + raw.replace(/\]\s*\[/g, ',') + ']'
    try {
      const outer = JSON.parse(fixed)
      // Flatten one level: [[...], [...]] -> [...]
      return Array.isArray(outer[0]) ? outer.flat() : outer
    } catch {
      console.error('Failed to parse paginated JSON response')
      return []
    }
  }
}

function ghJson<T>(args: string): T {
  return JSON.parse(gh(args))
}

// --- Core functions ---
function getPrState(repo: string, prNumber: string): PrState {
  return ghJson<PrState>(
    `pr view ${prNumber} -R ${repo} --json state,isDraft,headRefOid,headRefName`
  )
}

function getReviews(repo: string, prNumber: string): Review[] {
  return ghJsonArray<Review>(`api repos/${repo}/pulls/${prNumber}/reviews --paginate`)
}

function getReviewComments(repo: string, prNumber: string, reviewId: number): ReviewComment[] {
  return ghJsonArray<ReviewComment>(
    `api repos/${repo}/pulls/${prNumber}/reviews/${reviewId}/comments --paginate`
  )
}

/**
 * Fetch all review threads on a PR via GitHub GraphQL API.
 * Returns threads with resolution status and comment database IDs
 * so we can match them to REST API review comments.
 */
function getReviewThreads(repo: string, prNumber: string): ReviewThread[] {
  const [owner, name] = repo.split('/')
  const prNum = parseInt(prNumber, 10)
  const allThreads: ReviewThread[] = []

  try {
    let hasNext = true
    let cursor = ''

    while (hasNext) {
      const reviewThreadsArgs = ['first: 100']
      if (cursor) {
        reviewThreadsArgs.push(`after: "${cursor}"`)
      }
      const query = [
        '{',
        `  repository(owner: "${owner}", name: "${name}") {`,
        `    pullRequest(number: ${prNum}) {`,
        `      reviewThreads(${reviewThreadsArgs.join(', ')}) {`,
        '        pageInfo { hasNextPage endCursor }',
        '        nodes {',
        '          id',
        '          isResolved',
        '          comments(first: 100) { nodes { databaseId author { login } } }',
        '        }',
        '      }',
        '    }',
        '  }',
        '}',
      ].join(' ')

      const tmpFile = join(tmpdir(), `gql-threads-${Date.now()}.txt`)
      writeFileSync(tmpFile, query, 'utf-8')
      try {
        const raw = gh(`api graphql -F query=@${tmpFile}`)
        const parsed = JSON.parse(raw)
        const threads = parsed.data?.repository?.pullRequest?.reviewThreads
        if (!threads) break
        allThreads.push(...threads.nodes)
        hasNext = threads.pageInfo.hasNextPage
        cursor = threads.pageInfo.endCursor || ''
      } finally {
        try {
          unlinkSync(tmpFile)
        } catch {
          /* ignore */
        }
      }
    }
  } catch (err: any) {
    console.log(
      `  Warning: Could not fetch review threads via GraphQL: ${err.message?.slice(0, 200)}`
    )
  }

  return allThreads
}

/**
 * Check if a review thread was initiated by a Copilot bot.
 */
function isCopilotThread(thread: ReviewThread): boolean {
  return thread.comments.nodes.some(
    (c) => c.author?.login?.toLowerCase().includes('copilot') ?? false
  )
}

/**
 * Resolve a single review thread by its GraphQL node ID.
 * Returns true on success, false on failure.
 */
function resolveThread(threadId: string): boolean {
  const mutation = `mutation { resolveReviewThread(input: {threadId: "${threadId}"}) { thread { id } } }`
  const tmpFile = join(tmpdir(), `gql-resolve-${Date.now()}.txt`)
  writeFileSync(tmpFile, mutation, 'utf-8')
  try {
    gh(`api graphql -F query=@${tmpFile}`)
    return true
  } catch (err: any) {
    console.log(`  Warning: Could not resolve thread ${threadId}: ${err.message?.slice(0, 100)}`)
    return false
  } finally {
    try {
      unlinkSync(tmpFile)
    } catch {
      /* ignore */
    }
  }
}

/**
 * Resolve all unresolved Copilot review threads whose comments match
 * the given review comment IDs. This prevents old threads from
 * being re-flagged in subsequent Copilot review rounds.
 * Only resolves threads initiated by Copilot - human threads are left intact.
 */
function resolveReviewThreads(repo: string, prNumber: string, reviewCommentIds: number[]): number {
  if (reviewCommentIds.length === 0) return 0

  const commentIdSet = new Set(reviewCommentIds)
  const threads = getReviewThreads(repo, prNumber)

  let resolved = 0
  for (const thread of threads) {
    if (thread.isResolved) continue
    if (!isCopilotThread(thread)) continue

    const hasMatchingComment = thread.comments.nodes.some((c) => commentIdSet.has(c.databaseId))
    if (!hasMatchingComment) continue

    if (resolveThread(thread.id)) resolved++
  }

  return resolved
}

/**
 * Resolve all unresolved Copilot-initiated review threads on a PR.
 * Used when the review cycle passes clean to close out all remaining threads.
 * Human-initiated threads are left intact.
 */
function resolveAllCopilotThreads(repo: string, prNumber: string): number {
  const threads = getReviewThreads(repo, prNumber)
  let resolved = 0
  for (const thread of threads) {
    if (thread.isResolved) continue
    if (!isCopilotThread(thread)) continue
    if (resolveThread(thread.id)) resolved++
  }
  return resolved
}

function requestCopilotReview(repo: string, prNumber: string): void {
  console.log('Requesting Copilot review...')
  try {
    // Official method since gh v2.88.0 (March 2026)
    gh(`pr edit ${prNumber} -R ${repo} --add-reviewer @copilot`)
    console.log('  Review requested via gh CLI (--add-reviewer @copilot).')
  } catch {
    console.log('  gh CLI failed, falling back to @copilot comment...')
    gh(`pr comment ${prNumber} -R ${repo} --body "@copilot review"`)
    console.log('  Review requested via comment.')
  }
}

function postComment(repo: string, prNumber: string, body: string): void {
  const tmpFile = join(tmpdir(), `copilot-review-${Date.now()}.md`)
  writeFileSync(tmpFile, body, 'utf-8')
  try {
    gh(`pr comment ${prNumber} -R ${repo} --body-file "${tmpFile}"`)
  } finally {
    try {
      unlinkSync(tmpFile)
    } catch {
      // ignore cleanup errors
    }
  }
}

function assignCopilotToFix(repo: string, prNumber: string, comments: ReviewComment[]): void {
  console.log('Requesting fixes via @copilot PR comment (pushes to same branch)...')

  const commentList = comments
    .map((c, i) => {
      const loc = c.line ? `${c.path}:${c.line}` : c.path
      return `${i + 1}. \`${loc}\`: ${c.body}`
    })
    .join('\n')

  // Comment on the PR with @copilot - Copilot pushes fixes to the SAME branch.
  // This avoids creating separate issues/sub-PRs that cause cascading review loops.
  const body = [
    `@copilot Please fix the following review comments directly on this PR branch:\n`,
    commentList,
    `\nPush the fixes as a new commit to this PR branch. Do NOT create a separate PR or issue.`,
  ].join('\n')

  try {
    postComment(repo, prNumber, body)
    console.log('  Fix request posted as @copilot PR comment.')
  } catch (err: any) {
    console.log(`  Failed to post @copilot comment: ${err.message || err}`)
    // Fallback: post without @copilot mention
    const fallbackBody = buildFixRequestComment(comments)
    postComment(repo, prNumber, fallbackBody)
  }
}

/** Cooldown between rounds to avoid hitting Copilot review API rate limits. */
const ROUND_COOLDOWN_MS = 60_000

function dispatchNextRound(
  repo: string,
  prNumber: string,
  nextRound: number,
  maxRounds: number,
  autoMerge: boolean
): void {
  console.log(
    `Cooldown: waiting ${ROUND_COOLDOWN_MS / 1000}s before dispatching round ${nextRound}/${maxRounds}...`
  )
  execSync(`sleep ${ROUND_COOLDOWN_MS / 1000}`, { stdio: 'inherit' })
  console.log(`Dispatching round ${nextRound}/${maxRounds}...`)
  gh(
    `workflow run copilot-review-cycle.yml -R ${repo} ` +
      `-f pr_number=${prNumber} ` +
      `-f round=${nextRound} ` +
      `-f max_rounds=${maxRounds} ` +
      `-f auto_merge=${autoMerge}`
  )
}

function isCopilotReview(review: Review): boolean {
  return review.user.login.toLowerCase().includes('copilot')
}

async function waitForCopilotReview(
  repo: string,
  prNumber: string,
  afterId: number
): Promise<Review | null> {
  const startTime = Date.now()
  console.log(`Polling for Copilot review (timeout: ${REVIEW_TIMEOUT_MS / 60000} min)...`)

  while (Date.now() - startTime < REVIEW_TIMEOUT_MS) {
    await sleep(REVIEW_POLL_INTERVAL_MS)

    const pr = getPrState(repo, prNumber)
    if (pr.state !== 'OPEN') {
      console.log(`  PR is ${pr.state}, stopping.`)
      return null
    }

    const reviews = getReviews(repo, prNumber)
    const newCopilotReview = reviews.find((r) => r.id > afterId && isCopilotReview(r))

    if (newCopilotReview) {
      console.log(
        `  Copilot review found (id: ${newCopilotReview.id}, state: ${newCopilotReview.state})`
      )
      return newCopilotReview
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000)
    process.stdout.write(`  Waiting... (${elapsed}s)\r`)
  }

  return null // timeout
}

interface SubPr {
  number: number
  headRefName: string
  state: string
  isDraft: boolean
  mergeable: string
}

/**
 * Find a Copilot sub-PR targeting the given branch.
 * Copilot coding agent creates branches named `copilot/sub-pr-{number}`.
 * Only matches this specific pattern to avoid merging unrelated Copilot PRs.
 */
function findCopilotSubPr(repo: string, targetBranch: string): SubPr | null {
  try {
    // Sanitize branch name to prevent shell injection via special characters
    const safeBranch = targetBranch.replace(/[^a-zA-Z0-9/_.-]/g, '')
    const prs = ghJsonArray<SubPr>(
      `pr list -R ${repo} --state open --base "${safeBranch}" ` +
        `--json number,headRefName,state,isDraft,mergeable`
    )
    return prs.find((p) => /^copilot\/sub-pr-\d+$/.test(p.headRefName)) || null
  } catch {
    return null
  }
}

/**
 * Merge a Copilot sub-PR into the target branch.
 */
function mergeCopilotSubPr(repo: string, subPrNumber: number): boolean {
  console.log(`  Merging Copilot sub-PR #${subPrNumber}...`)
  try {
    // Mark as ready if draft
    try {
      gh(`pr ready ${subPrNumber} -R ${repo}`)
    } catch {
      // already ready or not a draft
    }
    gh(`pr merge ${subPrNumber} -R ${repo} --merge --delete-branch --yes`)
    console.log(`  Sub-PR #${subPrNumber} merged successfully.`)
    return true
  } catch (err: any) {
    const stderr = err.stderr?.toString().trim() || ''
    const stdout = err.stdout?.toString().trim() || ''
    const detail = stderr || stdout || err.message || String(err)
    console.log(`  Failed to merge sub-PR #${subPrNumber}: ${detail}`)
    return false
  }
}

/**
 * Wait for fixes: polls for either a direct push to the PR branch
 * or a Copilot sub-PR targeting the branch (auto-merges if found).
 */
async function waitForFixes(
  repo: string,
  prNumber: string,
  originalSha: string,
  headBranch: string
): Promise<boolean> {
  const startTime = Date.now()
  console.log(
    `Waiting for fixes - direct push or Copilot sub-PR (timeout: ${FIX_TIMEOUT_MS / 60000} min)...`
  )

  while (Date.now() - startTime < FIX_TIMEOUT_MS) {
    await sleep(FIX_POLL_INTERVAL_MS)

    const pr = getPrState(repo, prNumber)
    if (pr.state !== 'OPEN') {
      console.log(`  PR is ${pr.state}, stopping.`)
      return false
    }

    // Check 1: Direct push to the PR branch
    if (pr.headRefOid !== originalSha) {
      console.log(`  New push detected: ${originalSha.slice(0, 7)} -> ${pr.headRefOid.slice(0, 7)}`)
      return true
    }

    // Check 2: Copilot sub-PR targeting the PR branch
    const subPr = findCopilotSubPr(repo, headBranch)
    if (subPr) {
      console.log(`  Found Copilot sub-PR #${subPr.number} (${subPr.headRefName})`)

      // Only attempt merge when GitHub confirms the sub-PR is mergeable
      if (subPr.mergeable !== 'MERGEABLE') {
        console.log(`  Sub-PR #${subPr.number} mergeable state: ${subPr.mergeable}, waiting...`)
      } else {
        const merged = mergeCopilotSubPr(repo, subPr.number)
        if (merged) {
          // Verify the main PR's HEAD actually changed
          for (let i = 0; i < 6; i++) {
            await sleep(5000)
            const updated = getPrState(repo, prNumber)
            if (updated.headRefOid !== originalSha) {
              console.log(
                `  HEAD updated: ${originalSha.slice(0, 7)} -> ${updated.headRefOid.slice(0, 7)}`
              )
              return true
            }
          }
          console.log('  Sub-PR merged but HEAD did not update within 30s. Continuing poll...')
        }
      }
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000)
    process.stdout.write(`  Waiting for fixes... (${elapsed}s)\r`)
  }

  return false // timeout
}

// --- CI check types ---
interface CheckRun {
  name: string
  status: string
  conclusion: string | null
  details_url: string
}

// Name of this workflow's check run - excluded from CI polling to avoid self-deadlock
const SELF_CHECK_NAME = 'Review Round'

/**
 * Wait for all CI checks on the PR to complete (excluding this workflow's own check run).
 * Returns 'pass' if all succeed, 'fail' if any fail, 'closed' if PR was closed, 'timeout' on timeout.
 */
async function waitForCi(
  repo: string,
  prNumber: string
): Promise<'pass' | 'fail' | 'closed' | 'timeout'> {
  const startTime = Date.now()
  console.log(`Waiting for CI checks (timeout: ${CI_TIMEOUT_MS / 60000} min)...`)

  while (Date.now() - startTime < CI_TIMEOUT_MS) {
    const pr = getPrState(repo, prNumber)
    if (pr.state !== 'OPEN') {
      console.log(`  PR is ${pr.state}, stopping.`)
      return 'closed'
    }

    const allChecks = ghJsonArray<CheckRun>(
      `api "repos/${repo}/commits/${pr.headRefOid}/check-runs?filter=latest" --jq ".check_runs" --paginate`
    )

    // Filter out this workflow's own check run to prevent self-deadlock
    const checks = allChecks.filter((c) => !c.name.startsWith(SELF_CHECK_NAME))

    if (checks.length === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      process.stdout.write(`  No checks yet... (${elapsed}s)\r`)
      await sleep(CI_POLL_INTERVAL_MS)
      continue
    }

    const pending = checks.filter((c) => c.status !== 'completed')
    if (pending.length > 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      process.stdout.write(`  ${pending.length} check(s) still running... (${elapsed}s)\r`)
      await sleep(CI_POLL_INTERVAL_MS)
      continue
    }

    // All completed
    const failed = checks.filter(
      (c) => c.conclusion !== 'success' && c.conclusion !== 'skipped' && c.conclusion !== 'neutral'
    )
    if (failed.length > 0) {
      console.log(`\n  CI failed: ${failed.map((c) => `${c.name} (${c.conclusion})`).join(', ')}`)
      return 'fail'
    }

    console.log(`\n  All ${checks.length} CI checks passed.`)
    return 'pass'
  }

  console.log('\n  CI check wait timed out.')
  return 'timeout'
}

/**
 * Close all open fix issues for a given PR number.
 */
function closeFixIssues(repo: string, prNumber: string, reason: string, excludeNumber = 0): void {
  try {
    const existingIssues = ghJsonArray<{ number: number; title: string }>(
      `issue list -R ${repo} --state open --limit 100 ` +
        `--search "fix: address Copilot review comments on PR #${prNumber} in:title" ` +
        `--json number,title`
    )
    const title = `fix: address Copilot review comments on PR #${prNumber}`
    for (const issue of existingIssues) {
      if (issue.title === title && issue.number !== excludeNumber) {
        console.log(`  Closing fix issue #${issue.number}: ${reason}`)
        gh(`issue close ${issue.number} -R ${repo} -c "${reason}"`)
      }
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Add a label to the PR if it doesn't already exist.
 */
function addLabel(repo: string, prNumber: string, label: string): void {
  try {
    gh(`pr edit ${prNumber} -R ${repo} --add-label "${label}"`)
    console.log(`  Added label: ${label}`)
  } catch (err: any) {
    const msg = err.stderr?.toString() || err.message || 'Unknown error'
    console.log(`  Could not add label "${label}": ${msg.slice(0, 200)}`)
  }
}

/**
 * Enable auto-merge on the PR (squash method).
 */
function enableAutoMerge(repo: string, prNumber: string): boolean {
  console.log('  Enabling auto-merge...')
  try {
    gh(`pr merge ${prNumber} -R ${repo} --auto --squash`)
    console.log('  Auto-merge enabled.')
    return true
  } catch (err: any) {
    const msg = err.stderr?.toString() || err.message || ''
    console.log(`  Could not enable auto-merge: ${msg.slice(0, 200)}`)
    return false
  }
}

function buildFixRequestComment(comments: ReviewComment[]): string {
  const lines = ['**Copilot Review Cycle:** The following comments need to be addressed:\n']

  for (let i = 0; i < comments.length; i++) {
    const c = comments[i]
    const location = c.line ? `${c.path}:${c.line}` : c.path
    lines.push(`${i + 1}. **\`${location}\`**: ${c.body}\n`)
  }

  return lines.join('\n')
}

function writeSummary(
  prNumber: string,
  round: number,
  maxRounds: number,
  result: string,
  commentCount: number,
  action: string
): void {
  const md = `
# Copilot Review Cycle - Round ${round}/${maxRounds}

**PR:** #${prNumber} | **Result:** ${result}

| Metric | Value |
|--------|-------|
| Comments found | ${commentCount} |
| Action taken | ${mdEscape(action)} |
`
  appendGithubStepSummary(md)
}

/**
 * Build a consolidated history of all Copilot review rounds for a PR.
 * Posted as the final comment when the review cycle passes clean.
 */
function buildRoundHistory(repo: string, prNumber: string, finalRound: number): string {
  const reviews = getReviews(repo, prNumber)
  const copilotReviews = reviews
    .filter((r) => isCopilotReview(r))
    .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())

  const rows: string[] = []
  const roundDetails: string[] = []

  for (let i = 0; i < copilotReviews.length; i++) {
    const review = copilotReviews[i]
    const comments = getReviewComments(repo, prNumber, review.id)
    const files = [...new Set(comments.map((c) => c.path.split('/').pop()))].join(', ') || '\u2014'
    const status = comments.length === 0 ? '\u2705 Clean' : '\ud83d\udd27 Fixed'
    const date = review.submitted_at.slice(0, 16).replace('T', ' ')
    rows.push(`| ${i + 1} | ${comments.length} | ${files} | ${status} | ${date} |`)

    if (comments.length > 0) {
      roundDetails.push(`### Round ${i + 1} Comments (${comments.length})\n`)
      for (const c of comments) {
        const loc = c.line ? `${c.path}:${c.line}` : c.path
        const body = c.body.replace(/\n/g, ' ').slice(0, 120)
        roundDetails.push(`- \`${loc}\` \u2014 ${body}`)
      }
      roundDetails.push('')
    }
  }

  let md = '## Copilot Review Cycle Summary\n\n'
  md += '| Round | Comments | Files | Status | Date (UTC) |\n'
  md += '|---|---|---|---|---|\n'
  md += rows.join('\n') + '\n\n'
  if (roundDetails.length > 0) {
    md += roundDetails.join('\n') + '\n'
  }
  md += '### Result\n\n'
  md += `\u2705 All automated review comments addressed in ${finalRound} round(s). Ready for final human review.\n`
  return md
}

// --- Main ---
async function main() {
  const repo = process.env.REPO_NAME
  const prNumber = process.env.PR_NUMBER
  const parsedRound = parseInt(process.env.ROUND || '1', 10)
  const round = Math.max(1, Number.isFinite(parsedRound) ? parsedRound : 1)
  const parsedMaxRounds = parseInt(process.env.MAX_ROUNDS || '14', 10)
  const maxRounds = Math.max(1, Number.isFinite(parsedMaxRounds) ? parsedMaxRounds : 14)
  const autoMerge = process.env.AUTO_MERGE === 'true'

  if (!repo || !prNumber) {
    console.error('Missing required env: REPO_NAME, PR_NUMBER')
    process.exit(1)
  }

  if (!process.env.GH_TOKEN) {
    console.error(
      'Missing GH_TOKEN. Configure COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN in copilot environment.'
    )
    process.exit(1)
  }

  console.log(`\n=== Copilot Review Cycle: Round ${round}/${maxRounds} for PR #${prNumber} ===\n`)

  // Step 1: Validate PR state
  const pr = getPrState(repo, prNumber)
  if (pr.state !== 'OPEN') {
    console.log(`PR is ${pr.state}. Nothing to do.`)
    writeSummary(prNumber, round, maxRounds, 'SKIPPED', 0, `PR is ${pr.state}`)
    process.exit(0)
  }
  if (pr.isDraft) {
    console.log('PR is a draft. Skipping review.')
    writeSummary(prNumber, round, maxRounds, 'SKIPPED', 0, 'PR is draft')
    process.exit(0)
  }

  console.log(`Branch: ${pr.headRefName} (${pr.headRefOid.slice(0, 7)})`)

  // Step 2: Get last known review ID
  const existingReviews = getReviews(repo, prNumber)
  const lastReviewId =
    existingReviews.length > 0 ? Math.max(...existingReviews.map((r) => r.id)) : 0

  // Step 3: Request Copilot review
  requestCopilotReview(repo, prNumber)

  // Step 4: Wait for review
  const review = await waitForCopilotReview(repo, prNumber, lastReviewId)

  if (!review) {
    console.log('\nCopilot review did not arrive within timeout.')
    if (round >= maxRounds) {
      postComment(
        repo,
        prNumber,
        `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Timed out waiting for Copilot review and max rounds reached. Human attention needed.`
      )
      writeSummary(
        prNumber,
        round,
        maxRounds,
        'TIMEOUT_MAX_ROUNDS',
        0,
        'Review timeout at max rounds'
      )
      process.exit(1)
    }
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Timed out waiting for Copilot review. You can re-trigger manually.`
    )
    writeSummary(
      prNumber,
      round,
      maxRounds,
      'TIMEOUT',
      0,
      `Review timeout, dispatching round ${round + 1}`
    )
    dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
    process.exit(0)
  }

  // Step 5: Check comments
  const comments = getReviewComments(repo, prNumber, review.id)
  console.log(`\nReview has ${comments.length} inline comment(s).`)

  if (comments.length === 0) {
    console.log('\nCopilot review is clean!')

    // Resolve all remaining Copilot-initiated review threads - cycle is complete
    // Human-initiated threads are left intact to preserve human review workflows.
    console.log('Resolving remaining Copilot review threads...')
    const resolvedOnClean = resolveAllCopilotThreads(repo, prNumber)
    if (resolvedOnClean > 0) {
      console.log(`  Resolved ${resolvedOnClean} Copilot thread(s).`)
    }

    // Close any remaining fix issues from previous rounds
    closeFixIssues(repo, prNumber, 'All review comments resolved - review passed clean.')

    // Build consolidated round history for the final comment
    const roundHistory = buildRoundHistory(repo, prNumber, round)

    // Wait for CI to pass before declaring ready
    console.log('\nWaiting for CI before marking ready to merge...')
    const ciResult = await waitForCi(repo, prNumber)

    if (ciResult === 'pass') {
      addLabel(repo, prNumber, 'ready-to-merge')
      let mergeNote = ''
      if (autoMerge) {
        const merged = enableAutoMerge(repo, prNumber)
        mergeNote = merged
          ? ' Auto-merge has been enabled.'
          : ' Auto-merge could not be enabled - merge manually.'
      }
      postComment(
        repo,
        prNumber,
        `${roundHistory}\n\n**Copilot Review Cycle:** ✅ Passed after ${round} round(s) - review clean, all CI checks green. Ready to merge.${mergeNote}`
      )
      writeSummary(prNumber, round, maxRounds, 'READY_TO_MERGE', 0, 'Review clean + CI green')
    } else if (ciResult === 'fail') {
      postComment(
        repo,
        prNumber,
        `**Copilot Review Cycle:** Review passed after ${round} round(s), but CI is failing. Please investigate CI failures before merging.`
      )
      writeSummary(
        prNumber,
        round,
        maxRounds,
        'REVIEW_CLEAN_CI_FAIL',
        0,
        `Review clean, CI failed, dispatching round ${round + 1}`
      )
      dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
      process.exit(0)
    } else if (ciResult === 'closed') {
      console.log('PR was closed while waiting for CI.')
      writeSummary(prNumber, round, maxRounds, 'PR_CLOSED', 0, 'PR closed during CI wait')
      process.exit(0)
    } else {
      // timeout
      postComment(
        repo,
        prNumber,
        `**Copilot Review Cycle:** Review passed after ${round} round(s), but CI did not complete within timeout. Check CI manually before merging.`
      )
      writeSummary(
        prNumber,
        round,
        maxRounds,
        'REVIEW_CLEAN_CI_TIMEOUT',
        0,
        `Review clean, CI timed out, dispatching round ${round + 1}`
      )
      dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
      process.exit(0)
    }

    process.exit(0)
  }

  // Step 6: Comments found - log them
  console.log('\nComments:')
  for (const c of comments) {
    const loc = c.line ? `${c.path}:${c.line}` : c.path
    console.log(`  - ${loc}: ${c.body.slice(0, 120)}`)
  }

  // Step 7: Check max rounds
  if (round >= maxRounds) {
    console.log(`\nMax rounds (${maxRounds}) reached. Human attention needed.`)
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Max rounds reached. ${comments.length} comment(s) still need human attention.`
    )
    writeSummary(prNumber, round, maxRounds, 'MAX_ROUNDS', comments.length, 'Needs human attention')
    process.exit(1)
  }

  // Step 8: Assign Copilot coding agent to fix comments
  assignCopilotToFix(repo, prNumber, comments)

  // Step 9: Wait for fixes - direct push or Copilot sub-PR (auto-merged)
  const headSha = pr.headRefOid
  const fixed = await waitForFixes(repo, prNumber, headSha, pr.headRefName)

  if (!fixed) {
    console.log('\nNo fixes within timeout. Re-requesting fix...')
    assignCopilotToFix(repo, prNumber, comments)
    const retryFixed = await waitForFixes(repo, prNumber, headSha, pr.headRefName)

    if (!retryFixed) {
      console.log('\nRetry also timed out. Dispatching next round - review will re-check.')
      postComment(
        repo,
        prNumber,
        `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Fix timeout after retry. Dispatching next round to re-check. ${comments.length} comment(s) may still need attention.`
      )
      writeSummary(
        prNumber,
        round,
        maxRounds,
        'FIX_TIMEOUT_RETRY',
        comments.length,
        `Dispatching round ${round + 1} after retry`
      )
      dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
      process.exit(0)
    }
  }

  // Step 10: Wait for CI to pass before dispatching next review round
  console.log('\nWaiting for CI on fixed commit before next review round...')
  const ciResult = await waitForCi(repo, prNumber)

  if (ciResult === 'fail') {
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Fixes were pushed but CI is failing. Pausing review cycle until CI is fixed.`
    )
    writeSummary(
      prNumber,
      round,
      maxRounds,
      'CI_FAIL',
      comments.length,
      `Fixes broke CI, dispatching round ${round + 1}`
    )
    dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
    process.exit(0)
  }

  if (ciResult === 'closed') {
    console.log('PR was closed while waiting for CI.')
    writeSummary(
      prNumber,
      round,
      maxRounds,
      'PR_CLOSED',
      comments.length,
      'PR closed during CI wait'
    )
    process.exit(0)
  }

  if (ciResult === 'timeout') {
    console.log('\nCI timed out after fixes. Dispatching next round - it will re-check.')
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Fixes pushed but CI timed out (likely action_required gate). Dispatching next round automatically.`
    )
    writeSummary(
      prNumber,
      round,
      maxRounds,
      'CI_TIMEOUT_CONTINUE',
      comments.length,
      `CI timeout, dispatching round ${round + 1}`
    )
    dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
    process.exit(0)
  }

  // Step 11: Resolve review threads from this round so they don't re-trigger
  console.log('\nResolving review threads from this round...')
  const commentIds = comments.map((c) => c.id)
  const resolvedCount = resolveReviewThreads(repo, prNumber, commentIds)
  console.log(`  Resolved ${resolvedCount}/${comments.length} thread(s).`)

  // Step 12: Dispatch next round
  writeSummary(
    prNumber,
    round,
    maxRounds,
    'FIXES_PUSHED',
    comments.length,
    `Dispatching round ${round + 1} (resolved ${resolvedCount} threads)`
  )
  dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
  console.log(`\nRound ${round} complete. Next round dispatched.`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
