/**
 * Escapes special regex characters in a string so it can be used as a literal
 * match inside a `RegExp` constructor.
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
