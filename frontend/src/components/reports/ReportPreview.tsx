import { sanitizeHtml } from "../../utils/sanitize";

export default function ReportPreview({ html }: { html: string }) {
  const safeHtml = sanitizeHtml(html);
  return <div id="clinical-report" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
