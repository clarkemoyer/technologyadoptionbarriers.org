import { appendFileSync } from 'node:fs'

/**
 * Append Markdown content to the GitHub Actions Step Summary.
 *
 * No-op when `GITHUB_STEP_SUMMARY` is not set (e.g., local runs).
 * Writing the GitHub step summary should never break local runs or CI.
 */
export function appendGithubStepSummary(markdown: string) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (!summaryPath) {
    return
  }

  try {
    appendFileSync(summaryPath, markdown)
  } catch (error) {
    console.warn('Unable to write GitHub step summary:', error)
  }
}

/**
 * Escape special characters that can break GitHub-flavored Markdown tables.
 */
export function mdEscape(text: string): string {
  // Escape backslashes, then pipes, then replace newlines/carriage returns with spaces
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/[\n\r]/g, ' ')
}
