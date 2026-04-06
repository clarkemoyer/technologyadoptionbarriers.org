/**
 * Serializes a value to a JSON string safe for embedding inside a
 * `<script type="application/ld+json">` tag via `dangerouslySetInnerHTML`.
 *
 * The `<` character is replaced with its Unicode escape `\u003c` so that a
 * string value containing `</script>` cannot prematurely close the enclosing
 * script element and introduce an XSS vector.
 *
 * @see https://owasp.org/www-community/attacks/xss/
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
