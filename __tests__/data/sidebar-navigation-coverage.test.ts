import * as fs from 'fs'
import * as path from 'path'
import { sidebarSections } from '../../src/data/sidebar-navigation'

/**
 * Sidebar Navigation Route Coverage Test
 *
 * Ensures every page route in the app has a corresponding link
 * in the left-hand sidebar navigation. This catches:
 * - New pages added without sidebar navigation
 * - Existing pages that were accidentally dropped from navigation
 *
 * Exempt routes (not expected in sidebar):
 * - Dynamic route folders (e.g. [role], [slide])
 * - ClientRedirect pages (they redirect elsewhere)
 * - Special terminal pages (e.g. /survey-complete)
 */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const APP_DIR = path.join(__dirname, '..', '..', 'src', 'app')

/** Recursively find all page.tsx files under a directory. */
function findPageFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const results: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findPageFiles(fullPath))
    } else if (entry.name === 'page.tsx') {
      results.push(fullPath)
    }
  }

  return results
}

/** Convert a page.tsx file path to a URL path. */
function filePathToUrl(filePath: string): string {
  const relative = path.relative(APP_DIR, path.dirname(filePath)).replace(/\\/g, '/')
  return relative ? `/${relative}` : '/'
}

/** Check whether a page.tsx file uses ClientRedirect. */
function isRedirectPage(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf8')
  return content.includes('ClientRedirect')
}

/**
 * Routes that are intentionally exempt from sidebar navigation.
 *
 * These are terminal/utility pages that users reach via direct action
 * (e.g. completing a survey) rather than site navigation.
 */
const EXEMPT_ROUTES = new Set([
  '/survey-complete',
  '/tabs-presentation',
  '/making-of-tabs/seo/baseline-audit',
  '/making-of-tabs/seo/dashboard',
  '/making-of-tabs/seo/strategy',
])

/* ------------------------------------------------------------------ */
/*  Collect sidebar links                                              */
/* ------------------------------------------------------------------ */

function collectSidebarLinks(): Set<string> {
  const links = new Set<string>()
  for (const section of sidebarSections) {
    if (section.href) links.add(section.href)
    for (const group of section.groups) {
      for (const link of group.links) {
        links.add(link.href)
      }
    }
  }
  return links
}

/* ------------------------------------------------------------------ */
/*  Collect all app routes                                             */
/* ------------------------------------------------------------------ */

function collectAppRoutes(): { route: string; filePath: string }[] {
  const pageFiles = findPageFiles(APP_DIR)
  const routes: { route: string; filePath: string }[] = []

  for (const filePath of pageFiles) {
    const route = filePathToUrl(filePath)

    // Skip dynamic route segments (expanded at build time, covered by parent)
    if (route.includes('[')) continue

    routes.push({ route, filePath })
  }

  return routes
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('Sidebar navigation route coverage', () => {
  const sidebarLinks = collectSidebarLinks()
  const appRoutes = collectAppRoutes()

  // Filter to routes that should have sidebar links
  const routesRequiringSidebar = appRoutes.filter(({ route, filePath }) => {
    if (EXEMPT_ROUTES.has(route)) return false
    if (isRedirectPage(filePath)) return false
    return true
  })

  it('should have discovered app routes', () => {
    expect(appRoutes.length).toBeGreaterThan(50)
  })

  it('should have sidebar links', () => {
    expect(sidebarLinks.size).toBeGreaterThan(50)
  })

  // Generate a test for each route that requires a sidebar link
  it.each(routesRequiringSidebar.map(({ route }) => [route]))(
    'route %s has a sidebar navigation link',
    (route) => {
      expect(sidebarLinks).toContain(route)
    }
  )

  it('every non-exempt, non-redirect route has a sidebar link (summary)', () => {
    const missing = routesRequiringSidebar
      .filter(({ route }) => !sidebarLinks.has(route))
      .map(({ route }) => route)
      .sort()

    expect(missing).toEqual([])
  })
})
