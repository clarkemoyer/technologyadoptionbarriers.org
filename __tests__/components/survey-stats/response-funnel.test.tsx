import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import QualtricsSurveyStats from '../../../src/components/survey-stats/qualtrics-survey-stats'
import dispositionData from '../../../src/data/disposition-summary.json'
import metricsData from '../../../src/data/qualtrics-metrics.json'
import { TOTAL_ITEMS_PRESENTED } from '../../../src/lib/tabs-survey-constants'

expect.extend(toHaveNoViolations)

describe('Response Funnel page (QualtricsSurveyStats)', () => {
  it('renders the new Response funnel page heading', () => {
    render(<QualtricsSurveyStats />)
    expect(screen.getByRole('heading', { name: /response funnel/i, level: 2 })).toBeInTheDocument()
  })

  it('renders all 7 numbered funnel sections', () => {
    render(<QualtricsSurveyStats />)
    const titles = [
      /1\. Top of funnel/i,
      /2\. Prolific study state/i,
      /3\. Submission outcomes/i,
      /4\. TABS disposition categories/i,
      /5\. AUTO-EXCLUDE reasons/i,
      /6\. IRI attention-check pass rates/i,
      /7\. Items presented/i,
    ]
    for (const title of titles) {
      expect(screen.getByRole('heading', { name: title, level: 3 })).toBeInTheDocument()
    }
  })

  it('renders Prolific approved (Surveys Completed) value from disposition data', () => {
    render(<QualtricsSurveyStats />)
    const approved = dispositionData.actions.approved
    // Approved appears at least once; also matches the homepage Statistics callout.
    expect(screen.getAllByText(approved.toLocaleString()).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Qualtrics question IDs and items presented as separate values', () => {
    render(<QualtricsSurveyStats />)
    // Scope to each MetricCard by its label heading. Plain getByText collides
    // whenever a daily-pipeline value (e.g. a disposition count) happens to
    // match the items-presented instrument constant.
    const questionIdsCard = screen
      .getByRole('heading', { name: /Qualtrics question IDs/i })
      .closest('.rounded-lg') as HTMLElement
    const itemsPresentedCard = screen
      .getByRole('heading', { name: /^Items presented$/i })
      .closest('.rounded-lg') as HTMLElement
    expect(
      within(questionIdsCard).getByText(metricsData.questionCount.toLocaleString())
    ).toBeInTheDocument()
    expect(
      within(itemsPresentedCard).getByText(TOTAL_ITEMS_PRESENTED.toLocaleString())
    ).toBeInTheDocument()
  })

  it('labels each metric card with its API source via badge text', () => {
    render(<QualtricsSurveyStats />)
    expect(screen.getAllByText(/Qualtrics API v3/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Prolific API v1/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/TABS analysis pipeline/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/TABS instrument constants/).length).toBeGreaterThan(0)
  })

  it('has no axe-core accessibility violations', async () => {
    const { container } = render(<QualtricsSurveyStats />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
