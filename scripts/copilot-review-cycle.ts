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
        timeout: 30_000,
      }).trim()
    } catch (error: any) {
      const msg = error.stderr?.toString() || error.message || ''
      // Retry on transient errors
      if (
        attempt < retries &&
        (msg.includes('502') || msg.includes('503') || msg.includes('rate'))
      ) {
        const delay = 1000 * Math.pow(2, attempt)
        console.log(`  Retry ${attempt}/${retries} after ${delay}ms...`)
        execSync(`sleep ${delay / 1000}`)
        continue
      }
      throw error
    }
  }
  throw new Error('Unreachable')
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
  return ghJson<Review[]>(`api repos/${repo}/pulls/${prNumber}/reviews --paginate`)
}

function getReviewComments(repo: string, prNumber: string, reviewId: number): ReviewComment[] {
  return ghJson<ReviewComment[]>(`api repos/${repo}/pulls/${prNumber}/reviews/${reviewId}/comments`)
}

function requestCopilotReview(repo: string, prNumber: string): void {
  console.log('Requesting Copilot review...')
  try {
    gh(
      `api repos/${repo}/pulls/${prNumber}/requested_reviewers ` +
        `-X POST -f "reviewers[]=copilot-pull-request-reviewer[bot]"`
    )
    console.log('  Review requested via API.')
  } catch {
    // Fallback: trigger via comment
    console.log('  API request failed, falling back to @copilot comment...')
    gh(`pr comment ${prNumber} -R ${repo} --body "@copilot review"`)
    console.log('  Review requested via comment.')
  }
}

function postComment(repo: string, prNumber: string, body: string): void {
  // Write to temp file to avoid shell injection
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

function dispatchNextRound(
  repo: string,
  prNumber: string,
  nextRound: number,
  maxRounds: number
): void {
  console.log(`Dispatching round ${nextRound}/${maxRounds}...`)
  gh(
    `workflow run copilot-review-cycle.yml -R ${repo} ` +
      `-f pr_number=${prNumber} ` +
      `-f round=${nextRound} ` +
      `-f max_rounds=${maxRounds}`
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

    // Check if PR is still open
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

async function waitForNewPush(
  repo: string,
  prNumber: string,
  originalSha: string
): Promise<boolean> {
  const startTime = Date.now()
  console.log(`Waiting for Copilot to push fixes (timeout: ${FIX_TIMEOUT_MS / 60000} min)...`)

  while (Date.now() - startTime < FIX_TIMEOUT_MS) {
    await sleep(FIX_POLL_INTERVAL_MS)

    const pr = getPrState(repo, prNumber)
    if (pr.state !== 'OPEN') {
      console.log(`  PR is ${pr.state}, stopping.`)
      return false
    }

    if (pr.headRefOid !== originalSha) {
      console.log(`  New push detected: ${originalSha.slice(0, 7)} -> ${pr.headRefOid.slice(0, 7)}`)
      return true
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000)
    process.stdout.write(`  Waiting for push... (${elapsed}s)\r`)
  }

  return false // timeout
}

function buildFixRequestComment(comments: ReviewComment[]): string {
  const lines = [
    '@copilot Please address the following code review comments and push fixes to this branch:\n',
  ]

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

// --- Main ---
async function main() {
  const repo = process.env.REPO_NAME
  const prNumber = process.env.PR_NUMBER
  const round = Math.max(1, parseInt(process.env.ROUND || '1', 10))
  const maxRounds = Math.max(1, parseInt(process.env.MAX_ROUNDS || '7', 10))

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
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Timed out waiting for Copilot review. You can re-trigger manually.`
    )
    writeSummary(prNumber, round, maxRounds, 'TIMEOUT', 0, 'Review did not arrive')
    process.exit(1)
  }

  // Step 5: Check comments
  const comments = getReviewComments(repo, prNumber, review.id)
  console.log(`\nReview has ${comments.length} inline comment(s).`)

  if (comments.length === 0) {
    console.log('\nCopilot review is clean!')
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle:** Passed after ${round} round(s) with no comments.`
    )
    writeSummary(prNumber, round, maxRounds, 'CLEAN', 0, 'Review passed')
    process.exit(0)
  }

  // Step 6: Comments found — log them
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

  // Step 8: Ask Copilot to fix
  console.log('\nRequesting Copilot to fix comments...')
  const fixComment = buildFixRequestComment(comments)
  postComment(repo, prNumber, fixComment)

  // Step 9: Wait for Copilot to push fixes
  const headSha = pr.headRefOid
  const pushed = await waitForNewPush(repo, prNumber, headSha)

  if (!pushed) {
    console.log('\nCopilot coding agent did not push fixes within timeout.')
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle (Round ${round}/${maxRounds}):** Copilot did not push fixes within timeout. ${comments.length} comment(s) may need manual fixes.`
    )
    writeSummary(prNumber, round, maxRounds, 'FIX_TIMEOUT', comments.length, 'Agent did not push')
    process.exit(1)
  }

  // Step 10: Dispatch next round
  writeSummary(
    prNumber,
    round,
    maxRounds,
    'FIXES_PUSHED',
    comments.length,
    `Dispatching round ${round + 1}`
  )
  dispatchNextRound(repo, prNumber, round + 1, maxRounds)
  console.log(`\nRound ${round} complete. Next round dispatched.`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
