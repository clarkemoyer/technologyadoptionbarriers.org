import {
  getCurrentUser,
  listStudies,
  getStudyStatistics,
  exportSubmissionsCSV,
} from '../src/lib/prolific-api'

const rawApiToken = process.env.PROLIFIC_API_TOKEN

if (!rawApiToken) {
  console.error('Error: PROLIFIC_API_TOKEN environment variable is required')
  process.exit(1)
}

const API_TOKEN: string = rawApiToken
const STUDY_ID = process.env.STUDY_ID

async function main() {
  try {
    console.log('🔍 Connecting to Prolific API...\n')

    // Get current user info
    const user = await getCurrentUser(API_TOKEN)
    console.log('✅ Connected as:', user.name, `(${user.email})`)
    console.log('User ID:', user.id)
    console.log('Username:', user.username)
    console.log('')

    if (STUDY_ID) {
      // Query specific study
      console.log(`📊 Fetching data for study: ${STUDY_ID}\n`)
      const stats = await getStudyStatistics(STUDY_ID, API_TOKEN)

      console.log('Study Details:')
      console.log('  Name:', stats.study.name)
      console.log('  Internal Name:', stats.study.internal_name)
      console.log('  Status:', stats.study.status)
      console.log('  Description:', stats.study.description)
      console.log('  External URL:', stats.study.external_study_url)
      console.log('  Total Places:', stats.study.total_available_places)
      console.log('  Places Taken:', stats.study.places_taken)
      console.log('  Reward:', stats.study.reward, 'pence')
      console.log('  Average Reward/Hour:', stats.study.average_reward_per_hour, 'pence')
      console.log('  Maximum Time Allowed:', stats.study.maximum_allowed_time, 'seconds')
      console.log('  Created At:', stats.study.created_at)
      if (stats.study.published_at) {
        console.log('  Published At:', stats.study.published_at)
      }
      if (stats.study.completed_at) {
        console.log('  Completed At:', stats.study.completed_at)
      }
      console.log('')

      console.log('Submission Statistics:')
      console.log('  Total Submissions:', stats.totalSubmissions)
      console.log('  Completed:', stats.completedSubmissions)
      console.log('  Approved:', stats.approvedSubmissions)
      console.log('  Rejected:', stats.rejectedSubmissions)
      console.log('  Awaiting Review:', stats.awaitingReviewSubmissions)
      if (stats.averageTimeMinutes !== null) {
        console.log('  Average Time:', stats.averageTimeMinutes.toFixed(2), 'minutes')
      }
      console.log('')

      // Export CSV
      const csv = await exportSubmissionsCSV(STUDY_ID, API_TOKEN)
      console.log('📄 Submissions CSV Export:')
      console.log(csv)
    } else {
      // List all studies
      console.log('📋 Fetching all studies...\n')
      const studiesResponse = await listStudies(API_TOKEN)

      console.log(`Found ${studiesResponse.results.length} studies:\n`)

      for (const study of studiesResponse.results) {
        console.log('─'.repeat(80))
        console.log('Study ID:', study.id)
        console.log('Name:', study.name)
        console.log('Internal Name:', study.internal_name)
        console.log('Status:', study.status)
        console.log('Places:', `${study.places_taken}/${study.total_available_places}`)
        console.log('Reward:', study.reward, 'pence')
        console.log('Created:', study.created_at)
        console.log('')
      }

      console.log('─'.repeat(80))
      console.log('')
      console.log('💡 Tip: To get detailed statistics for a specific study, run:')
      console.log('   gh workflow run prolific.yml -f study_id=<STUDY_ID>')
    }

    console.log('\n✅ Data collection completed successfully')
  } catch (error: unknown) {
    console.error('❌ Error collecting Prolific data:', error)
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: unknown }).response
      console.error('API Response:', JSON.stringify(response, null, 2))
    }
    process.exit(1)
  }
}

main()
