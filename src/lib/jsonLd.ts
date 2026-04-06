/**
 * Serializes a JSON-LD object for safe inline embedding in a <script> tag.
 *
 * Replaces `<`, `>`, and `&` with their JSON unicode escapes so that the
 * HTML parser never sees a literal `<` or `&` inside the script block.
 * JSON parsers decode `\u003c`, `\u003e`, and `\u0026` back to `<`, `>`,
 * and `&`, so the structured-data semantics are preserved.
 *
 * @param obj - The JSON-LD object to serialize
 * @returns A JSON string safe to embed via dangerouslySetInnerHTML
 */
export function serializeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
