import DOMPurify from "dompurify";

export function sanitizeHtml(html: string, options?: { allowStyleTag?: boolean }): string {
  if (options?.allowStyleTag) {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ["style"]
    });
  }

  return DOMPurify.sanitize(html);
}
