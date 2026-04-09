import Link from 'next/link'

export interface PrevNextItem {
  title: string
  href: string
}

interface PrevNextCardsProps {
  prev?: PrevNextItem | null
  next?: PrevNextItem | null
  className?: string
}

export default function PrevNextCards({ prev, next, className }: PrevNextCardsProps) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Previous and next pages"
      className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className ?? ''}`}
    >
      {prev && (
        <Link
          href={prev.href}
          className="block p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-tabs-teal-deep hover:shadow-md transition-all"
        >
          <span className="text-tabs-teal-deep text-sm font-sans mb-1 block">← Previous</span>
          <span className="text-gray-900 font-semibold font-serif block">{prev.title}</span>
        </Link>
      )}
      {next && (
        <Link
          href={next.href}
          className="block p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-tabs-teal-deep hover:shadow-md transition-all text-right sm:col-start-2"
        >
          <span className="text-tabs-teal-deep text-sm font-sans mb-1 block">Next →</span>
          <span className="text-gray-900 font-semibold font-serif block">{next.title}</span>
        </Link>
      )}
    </nav>
  )
}
