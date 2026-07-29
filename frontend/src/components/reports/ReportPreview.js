import { jsx as _jsx } from "react/jsx-runtime";
import { sanitizeHtml } from "../../utils/sanitize";
export default function ReportPreview({ html }) {
    const safeHtml = sanitizeHtml(html);
    return _jsx("div", { id: "clinical-report", dangerouslySetInnerHTML: { __html: safeHtml } });
}
