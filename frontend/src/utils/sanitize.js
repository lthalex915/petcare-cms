import DOMPurify from "dompurify";
export function sanitizeHtml(html, options) {
    if (options?.allowStyleTag) {
        return DOMPurify.sanitize(html, {
            ADD_TAGS: ["style"]
        });
    }
    return DOMPurify.sanitize(html);
}
