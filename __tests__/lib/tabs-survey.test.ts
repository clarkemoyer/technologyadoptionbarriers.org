import {
  TABS_QUALTRICS_ANONYMOUS_SURVEY_URL,
  TABS_SURVEY_COMPLETE_PAGE_URL,
  TABS_SURVEY_WEBSITE_SOURCE,
  TABS_WEBSITE_QUALTRICS_SURVEY_URL,
  buildTabsQualtricsSurveyUrl,
} from '../../src/lib/tabs-survey'

describe('tabs-survey', () => {
  it('returns the base URL when params is empty', () => {
    expect(buildTabsQualtricsSurveyUrl({})).toBe(TABS_QUALTRICS_ANONYMOUS_SURVEY_URL)
  })

  it('appends query parameters and preserves their decoded values', () => {
    const url = buildTabsQualtricsSurveyUrl({
      SOURCE: 'website',
      COMPLETE_URL: 'https://example.com/survey complete?x=1&y=two',
    })

    const parsed = new URL(url)
    expect(parsed.origin + parsed.pathname).toBe(TABS_QUALTRICS_ANONYMOUS_SURVEY_URL)
    expect(parsed.searchParams.get('SOURCE')).toBe('website')
    expect(parsed.searchParams.get('COMPLETE_URL')).toBe(
      'https://example.com/survey complete?x=1&y=two'
    )
  })

  it('exports the website survey URL with expected defaults', () => {
    const parsed = new URL(TABS_WEBSITE_QUALTRICS_SURVEY_URL)
    expect(parsed.origin + parsed.pathname).toBe(TABS_QUALTRICS_ANONYMOUS_SURVEY_URL)

    expect(parsed.searchParams.get('SOURCE')).toBe(TABS_SURVEY_WEBSITE_SOURCE)
    expect(parsed.searchParams.get('COMPLETE_URL')).toBe(TABS_SURVEY_COMPLETE_PAGE_URL)
  })
})
