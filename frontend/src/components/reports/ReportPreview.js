import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sanitizeHtml } from "../../utils/sanitize";
function extractRenderParts(rawHtml) {
    const safeHtml = sanitizeHtml(rawHtml, { allowStyleTag: true });
    const styles = Array.from(safeHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map((match) => match[1].trim()).filter(Boolean);
    const bodyMatch = safeHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyHtml = (bodyMatch ? bodyMatch[1] : safeHtml)
        .replace(/<!doctype[^>]*>/gi, "")
        .replace(/<\/?html[^>]*>/gi, "")
        .replace(/<\/?head[^>]*>/gi, "")
        .replace(/<\/?body[^>]*>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .trim();
    return { styles, bodyHtml };
}
export default function ReportPreview({ html }) {
    const { styles, bodyHtml } = extractRenderParts(html);
    return (_jsxs("div", { id: "report-paper", style: {
            width: "210mm",
            maxWidth: "100%",
            margin: "0 auto",
            background: "#fff",
            minHeight: "297mm",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
            border: "1px solid #d8d8d8",
            boxSizing: "border-box",
            overflow: "hidden"
        }, children: [styles.map((css, index) => (_jsx("style", { children: css }, `report-style-${index}`))), _jsx("div", { id: "report-content", style: {
                    boxSizing: "border-box",
                    width: "100%",
                    minHeight: "297mm",
                    padding: "16mm"
                }, children: _jsx("div", { id: "report-render-root", dangerouslySetInnerHTML: { __html: bodyHtml } }) })] }));
}
