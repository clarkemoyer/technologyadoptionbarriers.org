/**
 * Normalize a Next.js pathname by stripping the basePath prefix and trailing slash.
 * Used by collection nav wrappers (ResultsNav, MakingOfTabsNav) to match
 * the current URL against series data hrefs.
 */
export function normalizePath(pathname: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const withoutBasePath =
    basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname
  const withoutTrailingSlash =
    withoutBasePath.length > 1 ? withoutBasePath.replace(/\/$/, '') : withoutBasePath
  return withoutTrailingSlash || '/'
}
