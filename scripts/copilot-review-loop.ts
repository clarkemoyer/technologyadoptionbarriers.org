import { execSync } from 'child_process'

async function run() {
  const prNumber = process.argv[2]
  if (!prNumber) {
    console.error('Usage: npx tsx scripts/copilot-review-loop.ts <pr-number>')
    process.exit(1)
  }

  console.log(`Requesting Copilot review for PR #${prNumber}...`)

  // We can't easily trigger the review via gh cli directly without the MCP tool,
  // but we can simulate the wait and check process.
  // Actually, adding a comment "@copilot review" might trigger it if the app is installed.
  try {
    execSync(`gh pr comment ${prNumber} --body "@copilot review"`, { stdio: 'inherit' })
  } catch (e) {
    console.error('Failed to request review via comment. Make sure gh cli is authenticated.')
  }

  console.log('Waiting for review to complete (polling every 15 seconds)...')

  const startTime = Date.now()
  let lastReviewCount = 0

  // Get initial review count
  try {
    const initialReviewsStr = execSync(
      `gh api repos/clarkemoyer/technologyadoptionbarriers.org/pulls/${prNumber}/reviews`
    ).toString()
    const initialReviews = JSON.parse(initialReviewsStr)
    lastReviewCount = initialReviews.length
  } catch (e) {
    console.log('Could not fetch initial reviews, starting from 0.')
  }

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 15000))

    if (Date.now() - startTime > 5 * 60 * 1000) {
      console.error('Timed out waiting for Copilot review after 5 minutes.')
      process.exit(1)
    }

    try {
      const reviewsStr = execSync(
        `gh api repos/clarkemoyer/technologyadoptionbarriers.org/pulls/${prNumber}/reviews`
      ).toString()
      const reviews = JSON.parse(reviewsStr)

      if (reviews.length > lastReviewCount) {
        const latestReview = reviews[reviews.length - 1]
        console.log(`\nNew review found! State: ${latestReview.state}`)

        // Fetch comments for this review
        const commentsStr = execSync(
          `gh api repos/clarkemoyer/technologyadoptionbarriers.org/pulls/${prNumber}/reviews/${latestReview.id}/comments`
        ).toString()
        const comments = JSON.parse(commentsStr)

        if (comments.length > 0) {
          console.log(`\n❌ Copilot left ${comments.length} inline comment(s):`)
          comments.forEach((c: any) => {
            console.log(`\nFile: ${c.path}:${c.line}`)
            console.log(`Comment: ${c.body}`)
          })
          console.log('\nPlease fix these issues, push, and run this script again.')
          process.exit(1)
        } else {
          console.log('\n✅ Copilot review completed with NO inline comments!')
          process.exit(0)
        }
      }
    } catch (e) {
      console.error('Error checking reviews:', e)
    }
  }
}

run().catch(console.error)
