import { getSurveyQuestions } from '../src/lib/qualtrics-api'
import { stripHtml } from '../src/lib/stripHtml'
import { appendGithubStepSummary, mdEscape } from '../src/lib/github-utils'

const API_TOKEN = process.env.QUALTRICS_API_TOKEN
const BASE_URL = process.env.QUALTRICS_BASE_URL
const SURVEY_ID = process.env.QUALTRICS_SURVEY_ID

if (!API_TOKEN || !BASE_URL || !SURVEY_ID) {
  console.error(
    'Error: Missing environment variables (QUALTRICS_API_TOKEN, QUALTRICS_BASE_URL, QUALTRICS_SURVEY_ID)'
  )
  process.exit(1)
}

async function main() {
  try {
    console.log(`🔍 Connecting to Qualtrics API (${BASE_URL})...`)
    console.log(`📊 Fetching questions for survey: ${SURVEY_ID}\n`)

    const data = await getSurveyQuestions(SURVEY_ID, API_TOKEN, BASE_URL)
    const questions = Object.values(data.Questions)

    console.log(`Found ${questions.length} questions:\n`)

    const summaryRows = []
    const openEndedPlaceholder = '<li><em>Open ended</em></li>'

    for (const q of questions) {
      const cleanText = stripHtml(q.QuestionText)
      console.log(`[${q.QuestionID}] (${q.QuestionType}) ${cleanText}`)

      let choicesText = ''
      if (q.Choices) {
        console.log('  Choices:')
        const choices = Object.values(q.Choices).map((c) => `    - ${stripHtml(c.Display)}`)
        choices.forEach((c) => console.log(c))
        choicesText = Object.values(q.Choices)
          .map((c) => `<li>${mdEscape(stripHtml(c.Display))}</li>`)
          .join('')
      }
      console.log('')

      summaryRows.push(
        `| **${mdEscape(q.QuestionID)}** | ${mdEscape(cleanText)} | <ul>${choicesText || openEndedPlaceholder}</ul> |`
      )
    }

    appendGithubStepSummary(
      [
        '## Qualtrics Survey Questions',
        '',
        `**Survey ID:** ${mdEscape(SURVEY_ID)}`,
        `**Total Questions:** ${questions.length}`,
        '',
        '| ID | Question | Choices |',
        '|---|---|---|',
        ...summaryRows,
        '',
      ].join('\n')
    )

    console.log('✅ Questions fetched successfully')
  } catch (error) {
    console.error('❌ Error fetching Qualtrics data:', error)
    process.exit(1)
  }
}

main()
