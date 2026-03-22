/**
 * Qualtrics Survey Flow Management
 *
 * Read and write operations for the survey flow:
 *   - Dump (read) the current flow
 *   - Reorder blocks in the flow
 *   - Add a block to the flow
 *   - Remove a block from the flow
 *
 * Authentication: Reuses the same tri-method auth pattern.
 *
 * Usage:
 *   QUALTRICS_FLOW_ACTION=dump     npx tsx scripts/qualtrics-update-flow.ts
 *   QUALTRICS_FLOW_ACTION=reorder  npx tsx scripts/qualtrics-update-flow.ts
 *   QUALTRICS_FLOW_ACTION=add      npx tsx scripts/qualtrics-update-flow.ts
 *   QUALTRICS_FLOW_ACTION=remove   npx tsx scripts/qualtrics-update-flow.ts
 *
 * Environment variables:
 *   QUALTRICS_API_TOKEN        - API token
 *   QUALTRICS_BASE_URL         - e.g. https://yul1.qualtrics.com
 *   QUALTRICS_SURVEY_ID        - Survey ID
 *   QUALTRICS_FLOW_ACTION      - One of: dump, reorder, add, remove
 *   QUALTRICS_BLOCK_IDS_ORDER  - Comma-separated block IDs for reorder (e.g. BL_abc,BL_def,BL_ghi)
 *   QUALTRICS_BLOCK_ID         - Block ID to add or remove
 *   QUALTRICS_FLOW_INSERT_AT   - Index to insert block at (for add; 0-based within Standard blocks)
 *   QUALTRICS_DRY_RUN          - If "true", preview changes without applying
 */

import * as fs from 'fs'
import * as path from 'path'

// ── Auth ──────────────────────────────────────────────────────────────────

type QualtricsAuth =
  | { kind: 'api-token'; apiToken: string }
  | { kind: 'oauth-bearer'; accessToken: string }

function resolveAuth(): QualtricsAuth {
  if (process.env.QUALTRICS_API_TOKEN) {
    return { kind: 'api-token', apiToken: process.env.QUALTRICS_API_TOKEN }
  }
  if (process.env.QUALTRICS_OAUTH_TOKEN) {
    return { kind: 'oauth-bearer', accessToken: process.env.QUALTRICS_OAUTH_TOKEN }
  }
  const cachePath = path.join(process.cwd(), '.vscode', 'qualtrics-oauth-token.local.json')
  if (fs.existsSync(cachePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
      const token = raw.access_token ?? raw.token?.access_token
      if (token) return { kind: 'oauth-bearer', accessToken: token }
    } catch {
      // fall through
    }
  }
  throw new Error('No Qualtrics auth found.')
}

function authHeaders(auth: QualtricsAuth): Record<string, string> {
  if (auth.kind === 'api-token') return { 'X-API-TOKEN': auth.apiToken }
  return { Authorization: `Bearer ${auth.accessToken}` }
}

// ── HTTP ──────────────────────────────────────────────────────────────────

async function httpJson(
  method: 'GET' | 'PUT',
  url: string,
  auth: QualtricsAuth,
  body?: unknown
): Promise<{ status: number; json: unknown; bodyText: string }> {
  const headers: Record<string, string> = {
    ...authHeaders(auth),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  const init: RequestInit = { method, headers }
  if (body !== undefined) init.body = JSON.stringify(body)
  const res = await fetch(url, init)
  const bodyText = await res.text()
  let json: unknown = null
  try {
    json = JSON.parse(bodyText)
  } catch {
    /* */
  }
  return { status: res.status, json, bodyText }
}

function unwrap(hr: { status: number; json: unknown; bodyText: string }, url: string): unknown {
  if (hr.status < 200 || hr.status >= 300) {
    throw new Error(`HTTP ${hr.status} from ${url}: ${hr.bodyText.slice(0, 1000)}`)
  }
  const obj = hr.json as Record<string, unknown> | null
  return obj?.result ?? obj
}

// ── Flow helpers ──────────────────────────────────────────────────────────

type FlowElement = Record<string, unknown>

function isStandardBlock(el: FlowElement): boolean {
  return el.Type === 'Standard'
}

function getBlockId(el: FlowElement): string | undefined {
  return el.ID as string | undefined
}

// ── Summary ───────────────────────────────────────────────────────────────

function appendSummary(text: string) {
  const p = process.env.GITHUB_STEP_SUMMARY
  if (p) fs.appendFileSync(p, text + '\n')
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const baseUrl = (process.env.QUALTRICS_BASE_URL ?? '').replace(/\/$/, '')
  const surveyId = process.env.QUALTRICS_SURVEY_ID ?? ''
  const action = (process.env.QUALTRICS_FLOW_ACTION ?? 'dump').toLowerCase()
  const dryRun = process.env.QUALTRICS_DRY_RUN === 'true'
  const blockIdsOrder = (process.env.QUALTRICS_BLOCK_IDS_ORDER ?? '').split(',').filter(Boolean)
  const blockId = process.env.QUALTRICS_BLOCK_ID ?? ''
  const insertAt = parseInt(process.env.QUALTRICS_FLOW_INSERT_AT ?? '-1', 10)

  if (!baseUrl) throw new Error('QUALTRICS_BASE_URL is required')
  if (!surveyId) throw new Error('QUALTRICS_SURVEY_ID is required')

  const auth = resolveAuth()
  const flowUrl = `${baseUrl}/API/v3/survey-definitions/${surveyId}/flow`

  console.log(`🔧 Qualtrics Flow Manager`)
  console.log(`   Survey: ${surveyId}`)
  console.log(`   Action: ${action}`)

  appendSummary(`## Qualtrics Flow Management`)
  appendSummary(`- **Survey ID:** \`${surveyId}\``)
  appendSummary(`- **Action:** \`${action}\``)
  appendSummary(`- **Dry run:** ${dryRun}`)
  appendSummary(``)

  // Fetch current flow
  const currentFlow = unwrap(await httpJson('GET', flowUrl, auth), flowUrl) as FlowElement
  const flowArray = (currentFlow.Flow as FlowElement[]) ?? []

  // Separate standard blocks from other flow elements
  const standardBlocks = flowArray.filter(isStandardBlock)
  const otherElements = flowArray.filter((el) => !isStandardBlock(el))

  console.log(`\n📊 Current flow: ${flowArray.length} elements (${standardBlocks.length} blocks)`)

  switch (action) {
    case 'dump': {
      console.log('\nStandard blocks in flow order:')
      for (let i = 0; i < standardBlocks.length; i++) {
        const bl = standardBlocks[i]
        console.log(`  ${i + 1}. ${bl.ID} (${bl.FlowID})`)
      }
      appendSummary(`### Current Flow Order`)
      appendSummary(``)
      appendSummary(`| # | Block ID | Flow ID |`)
      appendSummary(`|---|----------|---------|`)
      standardBlocks.forEach((bl, i) => {
        appendSummary(`| ${i + 1} | \`${bl.ID}\` | \`${bl.FlowID}\` |`)
      })
      break
    }

    case 'reorder': {
      if (blockIdsOrder.length === 0) {
        throw new Error('QUALTRICS_BLOCK_IDS_ORDER is required for reorder action')
      }
      // Validate all provided IDs exist
      const existingIds = new Set(standardBlocks.map(getBlockId))
      for (const id of blockIdsOrder) {
        if (!existingIds.has(id)) {
          throw new Error(
            `Block ID ${id} not found in current flow. Available: ${[...existingIds].join(', ')}`
          )
        }
      }

      // Reorder: take blocks in the specified order, then append any not mentioned
      const reordered: FlowElement[] = []
      const used = new Set<string>()
      for (const id of blockIdsOrder) {
        const block = standardBlocks.find((b) => getBlockId(b) === id)
        if (block) {
          reordered.push(block)
          used.add(id)
        }
      }
      // Append remaining blocks not in the order list
      for (const bl of standardBlocks) {
        if (!used.has(getBlockId(bl)!)) {
          reordered.push(bl)
        }
      }

      // Reconstruct full flow: other elements first, then reordered blocks
      // Actually, preserve original interleaving. Place non-standard elements where they were.
      const newFlow: FlowElement[] = []
      let blockIdx = 0
      for (const el of flowArray) {
        if (isStandardBlock(el)) {
          newFlow.push(reordered[blockIdx++])
        } else {
          newFlow.push(el)
        }
      }

      console.log('\nNew block order:')
      reordered.forEach((bl, i) => console.log(`  ${i + 1}. ${bl.ID}`))

      appendSummary(`### Reordered Flow`)
      appendSummary(``)
      reordered.forEach((bl, i) => appendSummary(`${i + 1}. \`${bl.ID}\``))

      if (dryRun) {
        console.log('\n🔍 DRY RUN — flow not updated.')
        appendSummary(`\n*Dry run — no changes applied.*`)
      } else {
        const updated = { ...currentFlow, Flow: newFlow }
        unwrap(await httpJson('PUT', flowUrl, auth, updated), flowUrl)
        console.log('\n✅ Flow updated.')
        appendSummary(`\n✅ Flow updated successfully.`)
      }
      break
    }

    case 'add': {
      if (!blockId) throw new Error('QUALTRICS_BLOCK_ID is required for add action')

      const newBlock: FlowElement = {
        Type: 'Standard',
        ID: blockId,
        FlowID: `FL_${Date.now()}`,
        Autofill: [],
      }

      const newFlow = [...flowArray]
      if (insertAt >= 0) {
        // Find the Nth standard block position in the full flow array
        let count = 0
        let insertIndex = newFlow.length
        for (let i = 0; i < newFlow.length; i++) {
          if (isStandardBlock(newFlow[i])) {
            if (count === insertAt) {
              insertIndex = i
              break
            }
            count++
          }
        }
        newFlow.splice(insertIndex, 0, newBlock)
      } else {
        // Append at end
        newFlow.push(newBlock)
      }

      console.log(`\n➕ Adding block ${blockId} at position ${insertAt >= 0 ? insertAt : 'end'}`)
      appendSummary(`### Add Block \`${blockId}\` at position ${insertAt >= 0 ? insertAt : 'end'}`)

      if (dryRun) {
        console.log('\n🔍 DRY RUN — flow not updated.')
        appendSummary(`\n*Dry run — no changes applied.*`)
      } else {
        const updated = { ...currentFlow, Flow: newFlow }
        unwrap(await httpJson('PUT', flowUrl, auth, updated), flowUrl)
        console.log('\n✅ Block added to flow.')
        appendSummary(`\n✅ Block added to flow.`)
      }
      break
    }

    case 'remove': {
      if (!blockId) throw new Error('QUALTRICS_BLOCK_ID is required for remove action')
      const newFlow = flowArray.filter((el) => getBlockId(el) !== blockId)
      if (newFlow.length === flowArray.length) {
        throw new Error(`Block ${blockId} not found in flow`)
      }

      console.log(`\n🗑️ Removing block ${blockId} from flow`)
      appendSummary(`### Remove Block \`${blockId}\``)

      if (dryRun) {
        console.log('\n🔍 DRY RUN — flow not updated.')
        appendSummary(`\n*Dry run — no changes applied.*`)
      } else {
        const updated = { ...currentFlow, Flow: newFlow }
        unwrap(await httpJson('PUT', flowUrl, auth, updated), flowUrl)
        console.log('\n✅ Block removed from flow.')
        appendSummary(`\n✅ Block removed from flow.`)
      }
      break
    }

    default:
      throw new Error(`Unknown action: ${action}. Use: dump, reorder, add, remove`)
  }
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`)
  appendSummary(`### ❌ Error\n\`\`\`\n${err instanceof Error ? err.message : err}\n\`\`\``)
  process.exit(1)
})
