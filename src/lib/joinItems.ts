/**
 * Joins an array of strings in natural-language list form.
 *
 * - 0 items → ''
 * - 1 item  → 'A'
 * - 2 items → 'A and B'
 * - 3+ items → 'A, B, and C'
 */
export function joinItems(xs: string[]): string {
  if (xs.length === 0) return ''
  if (xs.length === 1) return xs[0]
  if (xs.length === 2) return `${xs[0]} and ${xs[1]}`
  return `${xs.slice(0, -1).join(', ')}, and ${xs[xs.length - 1]}`
}
