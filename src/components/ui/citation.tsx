/**
 * Reusable Citation component for rendering DOI or URL links in reference lists.
 * Provides consistent styling across all article pages (APA 7th edition style).
 *
 * Usage:
 *   <Citation doi="10.1002/smj.4250050207" />
 *   <Citation url="https://www.nist.gov/cyberframework" label="NIST CSF" />
 *   <Citation doi="10.6028/NIST.SP.800-37r2" url="https://doi.org/10.6028/NIST.SP.800-37r2" />
 */

interface CitationProps {
  /** DOI string (without the https://doi.org/ prefix). Preferred over url when available. */
  doi?: string
  /** Full URL to use when no DOI exists (e.g., government documents, vendor whitepapers). */
  url?: string
  /** Optional display label. Defaults to the resolved doi.org or provided url. */
  label?: string
  /** Additional className overrides for the anchor element. */
  className?: string
}

/**
 * Renders a hyperlinked citation reference.
 * When a DOI is provided the link always points to https://doi.org/<doi>.
 * When only a url is provided, that url is used directly.
 * Returns null when neither doi nor url is supplied.
 */
export default function Citation({ doi, url, label, className }: CitationProps) {
  const href = doi ? `https://doi.org/${doi}` : url
  if (!href) return null

  const displayText = label ?? href

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? 'text-blue-600 hover:underline'}
    >
      {displayText}
    </a>
  )
}
