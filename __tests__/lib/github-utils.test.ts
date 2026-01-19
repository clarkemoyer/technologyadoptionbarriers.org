/**
 * @jest-environment node
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { appendGithubStepSummary, mdEscape } from '../../src/lib/github-utils'

describe('github-utils', () => {
  const originalSummaryPath = process.env.GITHUB_STEP_SUMMARY

  afterEach(() => {
    if (originalSummaryPath === undefined) {
      delete process.env.GITHUB_STEP_SUMMARY
    } else {
      process.env.GITHUB_STEP_SUMMARY = originalSummaryPath
    }
  })

  describe('appendGithubStepSummary', () => {
    it('no-ops when GITHUB_STEP_SUMMARY is not set', () => {
      delete process.env.GITHUB_STEP_SUMMARY

      expect(() => appendGithubStepSummary('hello')).not.toThrow()
    })

    it('appends content when GITHUB_STEP_SUMMARY is set', () => {
      const summaryFilePath = join(tmpdir(), `github-step-summary-${Date.now()}.md`)
      process.env.GITHUB_STEP_SUMMARY = summaryFilePath

      writeFileSync(summaryFilePath, 'start\n', 'utf8')
      appendGithubStepSummary('next\n')

      const contents = readFileSync(summaryFilePath, 'utf8')
      expect(contents).toBe('start\nnext\n')

      rmSync(summaryFilePath, { force: true })
    })

    it('does not throw if the summary file cannot be written', () => {
      const summaryDirPath = join(tmpdir(), `github-step-summary-dir-${Date.now()}`)
      mkdirSync(summaryDirPath)
      process.env.GITHUB_STEP_SUMMARY = summaryDirPath

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => appendGithubStepSummary('hello')).not.toThrow()

      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()

      rmSync(summaryDirPath, { recursive: true, force: true })
    })
  })

  describe('mdEscape', () => {
    it('escapes backslashes, pipes, and newlines for markdown tables', () => {
      const input = 'a\\b|c\nd\r'
      expect(mdEscape(input)).toBe('a\\\\b\\|c d ')
    })

    it('returns empty string unchanged', () => {
      expect(mdEscape('')).toBe('')
    })
  })
})
