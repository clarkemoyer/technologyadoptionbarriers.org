/**
 * Strips HTML tags and normalizes whitespace for display/logging.
 *
 * This is a lightweight helper intended for survey text coming back from APIs
 * (e.g., Qualtrics question text). It is not intended for security-critical HTML
 * sanitization.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
