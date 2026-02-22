const fs = require('fs')
const path = require('path')

const baseDir = path.join(__dirname, '../src/app/making-of-tabs/ai-validity-checks')

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList)
    } else if (filePath.endsWith('page.tsx')) {
      fileList.push(filePath)
    }
  }
  return fileList
}

const files = getFiles(baseDir)

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')

  // 1. Remove unused H3_CLASSES
  if (!content.includes('H3_CLASSES}')) {
    // If it's not used in the file body, remove it from import
    if (!content.split('export const metadata')[1]?.includes('H3_CLASSES')) {
      content = content.replace(/, H3_CLASSES/g, '')
    }
  }

  // 2. Add canonical URL
  // Extract the route path
  const relativePath = file
    .split('src\\app\\')[1]
    .replace(/\\page\.tsx$/, '')
    .replace(/\\/g, '/')
  const canonicalUrl = `/${relativePath}`

  if (!content.includes('canonical:')) {
    content = content.replace(
      /(description:.*?,?\n)(\s*})/,
      `$1  alternates: {\n    canonical: '${canonicalUrl}',\n  },\n$2`
    )
  }

  // 3. Add breadcrumbs
  if (!content.includes('aria-label="Breadcrumb"')) {
    const parts = canonicalUrl.split('/').filter(Boolean)
    let breadcrumbHtml = `\n        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-600">\n          <ol className="flex flex-wrap items-center gap-1">\n`

    let currentPath = ''
    for (let i = 0; i < parts.length; i++) {
      currentPath += `/${parts[i]}`
      const isLast = i === parts.length - 1

      let label = parts[i]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      if (parts[i] === 'making-of-tabs') label = 'Making of TABS'
      if (parts[i] === 'ai-validity-checks') label = 'AI Validity Checks'
      if (parts[i] === 'gemini-3-1-review') label = 'Gemini 3.1 Review'

      if (isLast) {
        breadcrumbHtml += `            <li aria-current="page" className="font-medium text-gray-900">\n              ${label}\n            </li>\n`
      } else {
        breadcrumbHtml += `            <li>\n              <Link href="${currentPath}" className="text-blue-700 hover:underline">\n                ${label}\n              </Link>\n            </li>\n            <li aria-hidden="true" className="px-1">\n              /\n            </li>\n`
      }
    }
    breadcrumbHtml += `          </ol>\n        </nav>`

    content = content.replace(
      /<article className=\{ARTICLE_CLASSES\}>/,
      `<article className={ARTICLE_CLASSES}>${breadcrumbHtml}`
    )
  }

  fs.writeFileSync(file, content, 'utf8')
  console.log(`Updated ${file}`)
}
