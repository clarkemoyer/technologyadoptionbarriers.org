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
const CI_TIMEOUT_MS = 15 * 60 * 1000
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
          // busy-wait — avoids shell sleep dependency
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
    // --paginate emits multiple JSON arrays: [...][...] — wrap and merge
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

function requestCopilotReview(repo: string, prNumber: string): void {
  console.log('Requesting Copilot review...')
  try {
    gh(
      `api repos/${repo}/pulls/${prNumber}/requested_reviewers ` +
        `-X POST -f "reviewers[]=copilot-pull-request-reviewer[bot]"`
    )
    console.log('  Review requested via API.')
  } catch {
    console.log('  API request failed, falling back to @copilot comment...')
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
  console.log('Assigning Copilot coding agent to fix comments...')

  // Close any existing open fix issues for this PR to prevent duplicates
  closeFixIssues(repo, prNumber, 'Superseded by new review round.')

  const commentList = comments
    .map((c, i) => {
      const loc = c.line ? `${c.path}:${c.line}` : c.path
      return `${i + 1}. \`${loc}\`: ${c.body}`
    })
    .join('\n')

  const body = [
    `Fix the following Copilot code review comments on PR #${prNumber}:\n`,
    commentList,
    `\nPush fixes to the PR branch directly or via a sub-PR (branch: copilot/sub-pr-<number>).`,
  ].join('\n')

  // Create a temporary issue and assign Copilot to it
  const tmpFile = join(tmpdir(), `copilot-fix-issue-${Date.now()}.md`)
  writeFileSync(tmpFile, body, 'utf-8')
  try {
    const result = gh(
      `issue create -R ${repo} ` +
        `--title "fix: address Copilot review comments on PR #${prNumber}" ` +
        `--body-file "${tmpFile}" ` +
        `--assignee copilot`
    )
    console.log(`  Issue created: ${result}`)
  } catch (err: any) {
    console.log('  Could not create fix issue via Copilot coding agent.')
    console.log('  Posting fix request as PR comment instead.')
    const fallbackBody = buildFixRequestComment(comments)
    postComment(repo, prNumber, fallbackBody)
  } finally {
    try {
      unlinkSync(tmpFile)
    } catch {
      // ignore
    }
  }
}

function dispatchNextRound(
  repo: string,
  prNumber: string,
  nextRound: number,
  maxRounds: number,
  autoMerge: boolean
): void {
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
    `Waiting for fixes — direct push or Copilot sub-PR (timeout: ${FIX_TIMEOUT_MS / 60000} min)...`
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
}

/**
 * Wait for all CI checks on the PR to complete.
 * Returns 'pass' if all succeed, 'fail' if any fail, null on timeout.
 */
async function waitForCi(repo: string, prNumber: string): Promise<'pass' | 'fail' | null> {
  const startTime = Date.now()
  console.log(`Waiting for CI checks (timeout: ${CI_TIMEOUT_MS / 60000} min)...`)

  while (Date.now() - startTime < CI_TIMEOUT_MS) {
    await sleep(CI_POLL_INTERVAL_MS)

    const pr = getPrState(repo, prNumber)
    if (pr.state !== 'OPEN') {
      console.log(`  PR is ${pr.state}, stopping.`)
      return null
    }

    const checks = ghJsonArray<CheckRun>(
      `api repos/${repo}/commits/${pr.headRefOid}/check-runs --jq ".check_runs" --paginate`
    )

    if (checks.length === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      process.stdout.write(`  No checks yet... (${elapsed}s)\r`)
      continue
    }

    const pending = checks.filter((c) => c.status !== 'completed')
    if (pending.length > 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      process.stdout.write(`  ${pending.length} check(s) still running... (${elapsed}s)\r`)
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
  return null
}

/**
 * Close all open fix issues for a given PR number.
 */
function closeFixIssues(repo: string, prNumber: string, reason: string): void {
  try {
    const existingIssues = ghJsonArray<{ number: number; title: string }>(
      `issue list -R ${repo} --state open ` +
        `--search "fix: address Copilot review comments on PR #${prNumber} in:title" ` +
        `--json number,title`
    )
    const title = `fix: address Copilot review comments on PR #${prNumber}`
    for (const issue of existingIssues) {
      if (issue.title === title) {
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
  } catch {
    console.log(`  Could not add label: ${label}`)
  }
}

/**
 * Enable auto-merge on the PR (squash method).
 */
function enableAutoMerge(repo: string, prNumber: string): void {
  console.log('  Enabling auto-merge...')
  try {
    gh(`pr merge ${prNumber} -R ${repo} --auto --squash`)
    console.log('  Auto-merge enabled.')
  } catch (err: any) {
    const msg = err.stderr?.toString() || err.message || ''
    console.log(`  Could not enable auto-merge: ${msg.slice(0, 200)}`)
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

// --- Main ---
async function main() {
  const repo = process.env.REPO_NAME
  const prNumber = process.env.PR_NUMBER
  const round = Math.max(1, parseInt(process.env.ROUND || '1', 10))
  const maxRounds = Math.max(1, parseInt(process.env.MAX_ROUNDS || '7', 10))
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

    // Close any remaining fix issues from previous rounds
    closeFixIssues(repo, prNumber, 'All review comments resolved — review passed clean.')

    // Wait for CI to pass before declaring ready
    console.log('\nWaiting for CI before marking ready to merge...')
    const ciResult = await waitForCi(repo, prNumber)

    if (ciResult === 'pass') {
      addLabel(repo, prNumber, 'ready-to-merge')
      const mergeNote = autoMerge ? ' Auto-merge has been enabled.' : ''
      postComment(
        repo,
        prNumber,
        `**Copilot Review Cycle:** ✅ Passed after ${round} round(s) — review clean, all CI checks green. Ready to merge.${mergeNote}`
      )
      if (autoMerge) {
        enableAutoMerge(repo, prNumber)
      }
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
        'Review clean but CI failed'
      )
      process.exit(1)
    } else {
      // timeout or PR closed
      postComment(
        repo,
        prNumber,
        `**Copilot Review Cycle:** Review passed after ${round} round(s). CI status could not be determined (timeout). Check CI manually before merging.`
      )
      writeSummary(
        prNumber,
        round,
        maxRounds,
        'REVIEW_CLEAN_CI_TIMEOUT',
        0,
        'Review clean, CI timed out'
      )
    }

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

  // Step 8: Assign Copilot coding agent to fix comments
  assignCopilotToFix(repo, prNumber, comments)

  // Step 9: Wait for fixes — direct push or Copilot sub-PR (auto-merged)
  const headSha = pr.headRefOid
  const fixed = await waitForFixes(repo, prNumber, headSha, pr.headRefName)

  if (!fixed) {
    console.log('\nNo fixes were pushed within timeout.')
    postComment(
      repo,
      prNumber,
      `**Copilot Review Cycle (Round ${round}/${maxRounds}):** No fixes pushed within timeout. ${comments.length} comment(s) may need manual fixes.`
    )
    writeSummary(prNumber, round, maxRounds, 'FIX_TIMEOUT', comments.length, 'No fixes pushed')
    process.exit(1)
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
    writeSummary(prNumber, round, maxRounds, 'CI_FAIL', comments.length, 'Fixes broke CI')
    process.exit(1)
  }

  if (ciResult === null) {
    // Timeout — dispatch next round anyway, CI may still be running
    console.log('  CI timed out, dispatching next round anyway...')
  }

  // Step 11: Dispatch next round
  writeSummary(
    prNumber,
    round,
    maxRounds,
    'FIXES_PUSHED',
    comments.length,
    `Dispatching round ${round + 1}`
  )
  dispatchNextRound(repo, prNumber, round + 1, maxRounds, autoMerge)
  console.log(`\nRound ${round} complete. Next round dispatched.`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
