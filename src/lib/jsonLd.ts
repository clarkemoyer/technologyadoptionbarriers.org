/**
 * Serializes a JSON-LD object for safe inline embedding in a <script> tag.
 *
 * Replaces `<` with the JSON unicode escape `\u003c` so that the HTML parser
 * never sees a literal `<` inside the script block. A JSON parser decodes
 * `\u003c` back to `<`, so the structured-data semantics are preserved.
 *
 * @param obj - The JSON-LD object to serialize
 * @returns A JSON string safe to embed via dangerouslySetInnerHTML
 */
export function serializeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}
