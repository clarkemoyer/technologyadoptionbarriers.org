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

    const data: any = await getSurveyQuestions(SURVEY_ID, API_TOKEN, BASE_URL)

    if (!data) {
      throw new Error('Received empty response from Qualtrics API')
    }

    const questions = Array.isArray(data.elements)
      ? data.elements
      : Object.values(data.Questions || {})

    if (!questions || questions.length === 0) {
      throw new Error(
        'Could not find questions array in Qualtrics API response. Unexpected schema.'
      )
    }

    console.log(`Found ${questions.length} questions:\n`)

    const summaryRows = []
    const openEndedPlaceholder = '<li><em>Open ended</em></li>'

    for (const q of questions) {
      const qId = q.QuestionID || q.questionId || 'Unknown'
      const qText = q.QuestionText || q.questionText || ''
      const qType = q.QuestionType || q.questionType?.type || 'Unknown'
      const rawChoices = q.Choices || q.choices

      const cleanText = stripHtml(qText)
      console.log(`[${qId}] (${qType}) ${cleanText}`)

      let choicesText = ''
      if (rawChoices) {
        console.log('  Choices:')
        const choicesList = Array.isArray(rawChoices) ? rawChoices : Object.values(rawChoices)

        choicesList.forEach((c: any) => {
          const display = c.Display || c.display || c.choiceText || ''
          console.log(`    - ${stripHtml(display)}`)
        })

        choicesText = choicesList
          .map((c: any) => {
            const display = c.Display || c.display || c.choiceText || ''
            return `<li>${mdEscape(stripHtml(display))}</li>`
          })
          .join('')
      }
      console.log('')

      summaryRows.push(
        `| **${mdEscape(qId)}** | ${mdEscape(cleanText)} | <ul>${choicesText || openEndedPlaceholder}</ul> |`
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
