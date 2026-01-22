/**
 * Public (non-sensitive) survey URL constants.
 *
 * - Keep the base Qualtrics anonymous link here so it is easy to find/update.
 * - Build source-specific links (website vs. Prolific) by appending query params.
 */

export const TABS_QUALTRICS_ANONYMOUS_SURVEY_URL =
  'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO'

export const TABS_SURVEY_WEBSITE_SOURCE = 'TABS_Website'

export const TABS_SURVEY_COMPLETE_PAGE_URL =
  'https://technologyadoptionbarriers.org/survey-complete'

export function buildTabsQualtricsSurveyUrl(params: Record<string, string>): string {
  const search = new URLSearchParams(params)
  const qs = search.toString()

  if (!qs) return TABS_QUALTRICS_ANONYMOUS_SURVEY_URL
  return `${TABS_QUALTRICS_ANONYMOUS_SURVEY_URL}?${qs}`
}

export const TABS_WEBSITE_QUALTRICS_SURVEY_URL = buildTabsQualtricsSurveyUrl({
  SOURCE: TABS_SURVEY_WEBSITE_SOURCE,
  COMPLETE_URL: TABS_SURVEY_COMPLETE_PAGE_URL,
})
