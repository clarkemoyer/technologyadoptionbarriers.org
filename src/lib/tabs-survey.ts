/**
 * Public (non-sensitive) survey URL constants.
 *
 * - Keep the base Qualtrics anonymous link here so it is easy to find/update.
 * - Build source-specific links (website vs. Prolific) by appending query params.
 */

export const TABS_QUALTRICS_ANONYMOUS_SURVEY_URL =
  'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO'

export const TABS_SURVEY_WEBSITE_SOURCE = 'TABS_Website'

export const TABS_SURVEY_PROLIFIC_SOURCE = 'prolific'

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

export type ProlificSurveyParams = {
  PROLIFIC_PID: string
  STUDY_ID: string
  SESSION_ID: string
}

export function buildProlificQualtricsSurveyUrl(params: ProlificSurveyParams): string {
  return buildTabsQualtricsSurveyUrl({
    ...params,
    SOURCE: TABS_SURVEY_PROLIFIC_SOURCE,
  })
}

// Safe to ship publicly: uses deterministic test IDs.
// The Qualtrics Survey Flow enforces the Prolific completion redirect URL.
export const TABS_PROLIFIC_SIM_QUALTRICS_SURVEY_URL = buildProlificQualtricsSurveyUrl({
  PROLIFIC_PID: 'tabs_prolific_web',
  STUDY_ID: 'tabs_prolific_web',
  SESSION_ID: 'tabs_prolific_web',
})
