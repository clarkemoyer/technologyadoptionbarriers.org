import fs from 'fs'
import path from 'path'

function updateSeoDashboardTimestamp() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'seo-metrics.json')

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(rawData)

    const now = new Date()
    data.generatedAt = now.toISOString()

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
    console.log(`Successfully updated SEO Dashboard generatedAt timestamp to: ${data.generatedAt}`)
  } catch (error) {
    console.error('Failed to update seo-metrics.json timestamp:', error)
    process.exit(1)
  }
}

updateSeoDashboardTimestamp()
