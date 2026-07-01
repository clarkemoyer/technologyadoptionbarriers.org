/**
 * @jest-environment node
 *
 * Real-library integration test for nodemailer. We deliberately do NOT mock
 * nodemailer: we drive its actual `createTransport` + `sendMail` pipeline via
 * the built-in `jsonTransport` (no network, no credentials). This means a
 * breaking change in a nodemailer upgrade surfaces here in CI instead of
 * silently at runtime in the weekly ga-report email workflow.
 */
import nodemailer from 'nodemailer'
import { extractMetrics, buildMailOptions } from '../../scripts/send-report-email'

// Shape mirrors a real ga-report-*.json: totals[0].metricValues is the ordered
// metric array (activeUsers, newUsers, sessions, <eventCount>, screenPageViews).
const sampleReport = {
  totals: [
    {
      metricValues: [
        { value: '100' }, // activeUsers
        { value: '40' }, // newUsers
        { value: '250' }, // sessions
        { value: '999' }, // (index 3, unused)
        { value: '500' }, // views
      ],
    },
  ],
}

describe('extractMetrics', () => {
  it('maps the ordered GA metric values to named fields', () => {
    expect(extractMetrics(sampleReport)).toEqual({
      activeUsers: '100',
      newUsers: '40',
      sessions: '250',
      views: '500',
    })
  })

  it('falls back to 0 for a missing/partial payload', () => {
    expect(extractMetrics({})).toEqual({
      activeUsers: '0',
      newUsers: '0',
      sessions: '0',
      views: '0',
    })
    expect(extractMetrics(undefined)).toEqual({
      activeUsers: '0',
      newUsers: '0',
      sessions: '0',
      views: '0',
    })
  })
})

describe('nodemailer integration (real library, jsonTransport)', () => {
  it('builds a transport and sends a message through the real API', async () => {
    const transporter = nodemailer.createTransport({ jsonTransport: true })

    const mailOptions = buildMailOptions({
      reportContent: sampleReport,
      from: 'sender@technologyadoptionbarriers.org',
      to: 'recipient@technologyadoptionbarriers.org',
      date: '2026-06-18',
    })

    const info = await transporter.sendMail(mailOptions)

    // jsonTransport returns the assembled message as a JSON string + an envelope.
    expect(info.messageId).toBeTruthy()
    expect(info.envelope.from).toBe('sender@technologyadoptionbarriers.org')
    expect(info.envelope.to).toContain('recipient@technologyadoptionbarriers.org')

    const message = JSON.parse(info.message as unknown as string)
    expect(message.subject).toBe('📊 TABS Weekly Analytics Report - 2026-06-18')
    expect(message.to[0].address).toBe('recipient@technologyadoptionbarriers.org')
    // The rendered metrics must reach the HTML body.
    expect(message.html).toContain('100') // activeUsers
    expect(message.html).toContain('500') // views
    expect(message.html).toContain('TABS Website Analytics')
  })
})
