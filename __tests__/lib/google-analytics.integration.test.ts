/**
 * @jest-environment node
 *
 * Real-library surface test for @google-analytics/data. The sibling
 * google-analytics.test.ts fully mocks the package, so it validates OUR call
 * shape but can NOT catch a breaking change in the library itself (a mock
 * always matches). This file imports the REAL package and exercises the exact
 * surface we depend on — the `BetaAnalyticsDataClient` constructor, the
 * `runReport` method, and the `protos.google.analytics.data.v1beta` namespace —
 * so an incompatible upgrade fails in CI instead of at runtime in the GA report
 * workflows. (Live request validation lives in ga-api-smoke.yml, which needs
 * real credentials; this is the no-network guard.)
 */
import { BetaAnalyticsDataClient, protos } from '@google-analytics/data'
import { GoogleAnalyticsClient } from '../../src/lib/google-analytics'

// A structurally valid (but fake) PEM; gapic auth is lazy, so construction does
// not validate or use it (no network).
const FAKE_CREDENTIALS = {
  client_email: 'tabs-test@example.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIBfake\n-----END PRIVATE KEY-----\n',
}

describe('@google-analytics/data real library surface', () => {
  it('exports BetaAnalyticsDataClient as a constructor', () => {
    expect(typeof BetaAnalyticsDataClient).toBe('function')
  })

  it('exposes the v1beta protos namespace we type against', () => {
    expect(protos?.google?.analytics?.data?.v1beta).toBeDefined()
    // MetricAggregation enum is the specific proto type google-analytics.ts imports.
    expect(protos.google.analytics.data.v1beta.MetricAggregation).toBeDefined()
  })

  it('constructs a real client exposing runReport (no mock, no network)', () => {
    const client = new BetaAnalyticsDataClient({ credentials: FAKE_CREDENTIALS })
    expect(typeof client.runReport).toBe('function')
  })

  it('our GoogleAnalyticsClient wraps the real client and rejects when GA_PROPERTY_ID is unset', async () => {
    const prev = process.env.GA_PROPERTY_ID
    delete process.env.GA_PROPERTY_ID
    try {
      const client = new GoogleAnalyticsClient()
      await expect(client.runReport()).rejects.toThrow('GA_PROPERTY_ID is not configured')
    } finally {
      if (prev !== undefined) process.env.GA_PROPERTY_ID = prev
    }
  })
})
