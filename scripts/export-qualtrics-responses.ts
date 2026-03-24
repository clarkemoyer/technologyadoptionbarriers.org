/**
 * Export Qualtrics survey responses to a CSV file.
 *
 * Downloads the response export ZIP, extracts the CSV, and writes it to OUTPUT_PATH.
 * Uses Node.js built-in zlib (no external ZIP library needed).
 *
 * Environment variables:
 *   QUALTRICS_API_TOKEN  – Qualtrics API token (required)
 *   QUALTRICS_BASE_URL   – Qualtrics data center base URL (required)
 *   QUALTRICS_SURVEY_ID  – Survey ID to export (required)
 *   OUTPUT_PATH          – Path to write the extracted CSV (required)
 */

import { exportSurveyResponses } from '../src/lib/qualtrics-api'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, basename } from 'node:path'
import { inflateRawSync } from 'node:zlib'

/**
 * Minimal ZIP extraction — finds the first .csv entry and inflates it.
 * Supports only DEFLATE (method 8) and STORED (method 0) entries.
 */
function extractCsvFromZip(zipBuffer: Buffer): string {
  let offset = 0

  while (offset < zipBuffer.length - 4) {
    const sig = zipBuffer.readUInt32LE(offset)
    if (sig !== 0x04034b50) break // Not a local file header

    const method = zipBuffer.readUInt16LE(offset + 8)
    const compressedSize = zipBuffer.readUInt32LE(offset + 18)
    const uncompressedSize = zipBuffer.readUInt32LE(offset + 22)
    const nameLen = zipBuffer.readUInt16LE(offset + 26)
    const extraLen = zipBuffer.readUInt16LE(offset + 28)
    const name = zipBuffer.subarray(offset + 30, offset + 30 + nameLen).toString('utf-8')
    const dataStart = offset + 30 + nameLen + extraLen

    if (basename(name).endsWith('.csv')) {
      const compressedData = zipBuffer.subarray(dataStart, dataStart + compressedSize)

      if (method === 0) {
        // STORED
        return compressedData.toString('utf-8')
      } else if (method === 8) {
        // DEFLATE
        const inflated = inflateRawSync(compressedData, { maxOutputLength: uncompressedSize * 2 })
        return inflated.toString('utf-8')
      } else {
        throw new Error(`Unsupported ZIP compression method ${method} for ${name}`)
      }
    }

    offset = dataStart + compressedSize
  }

  throw new Error('No CSV file found in export ZIP')
}

async function main() {
  const apiToken = process.env.QUALTRICS_API_TOKEN
  const baseUrl = process.env.QUALTRICS_BASE_URL
  const surveyId = process.env.QUALTRICS_SURVEY_ID
  const outputPath = process.env.OUTPUT_PATH

  if (!apiToken || !baseUrl || !surveyId || !outputPath) {
    console.error(
      'Error: QUALTRICS_API_TOKEN, QUALTRICS_BASE_URL, QUALTRICS_SURVEY_ID, and OUTPUT_PATH are required'
    )
    process.exit(1)
  }

  console.log(`Exporting responses for survey ${surveyId}...`)
  const zipBuffer = await exportSurveyResponses(surveyId, apiToken, baseUrl)
  console.log(`Downloaded ZIP (${zipBuffer.length} bytes)`)

  const csvContent = extractCsvFromZip(zipBuffer)
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, csvContent, 'utf-8')

  const lineCount = csvContent.split('\n').filter((l: string) => l.trim()).length
  console.log(`Wrote ${lineCount} lines to ${outputPath}`)
}

main().catch((error) => {
  console.error('Export failed:', error)
  process.exit(1)
})
