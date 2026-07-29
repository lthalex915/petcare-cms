import html2canvas from "html2canvas";
import jsPDF from "jspdf";
function pickPageBreakY(ctx, width, idealBreakY, minY, maxY) {
    const startY = Math.max(minY, idealBreakY - 140);
    const endY = Math.min(maxY, idealBreakY + 140);
    if (endY <= startY) {
        return idealBreakY;
    }
    let bestY = idealBreakY;
    let bestInkCount = Number.POSITIVE_INFINITY;
    for (let y = startY; y <= endY; y += 2) {
        const row = ctx.getImageData(0, y, width, 1).data;
        let inkCount = 0;
        for (let x = 0; x < row.length; x += 16) {
            const r = row[x];
            const g = row[x + 1];
            const b = row[x + 2];
            if (r < 245 || g < 245 || b < 245) {
                inkCount += 1;
            }
        }
        if (inkCount < bestInkCount) {
            bestInkCount = inkCount;
            bestY = y;
            if (inkCount === 0 && Math.abs(y - idealBreakY) <= 24) {
                break;
            }
        }
    }
    return bestY;
}
export async function exportReportToPDF(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element not found: ${elementId}`);
    }
    const a4WidthMm = 210;
    const a4HeightMm = 297;
    const exportMarginMm = 8;
    const contentWidthMm = a4WidthMm - exportMarginMm * 2;
    const contentHeightMm = a4HeightMm - exportMarginMm * 2;
    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pxPerMm = canvas.width / contentWidthMm;
    const pageHeightPx = Math.floor(contentHeightMm * pxPerMm);
    const sourceCtx = canvas.getContext("2d");
    if (!sourceCtx) {
        throw new Error("Failed to read report canvas for PDF export");
    }
    let yOffset = 0;
    let pageIndex = 0;
    while (yOffset < canvas.height) {
        const remainingPx = canvas.height - yOffset;
        let chunkHeightPx = Math.min(pageHeightPx, remainingPx);
        if (remainingPx > pageHeightPx) {
            const idealBreakY = yOffset + pageHeightPx;
            const minBreakY = yOffset + Math.floor(pageHeightPx * 0.75);
            const maxBreakY = Math.min(canvas.height - 1, yOffset + Math.floor(pageHeightPx * 1.05));
            const adjustedBreakY = pickPageBreakY(sourceCtx, canvas.width, idealBreakY, minBreakY, maxBreakY);
            chunkHeightPx = Math.max(1, adjustedBreakY - yOffset);
        }
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = chunkHeightPx;
        const pageCtx = pageCanvas.getContext("2d");
        if (!pageCtx) {
            throw new Error("Failed to create PDF page canvas");
        }
        pageCtx.fillStyle = "#FFFFFF";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(canvas, 0, yOffset, canvas.width, chunkHeightPx, 0, 0, pageCanvas.width, pageCanvas.height);
        const pageImgData = pageCanvas.toDataURL("image/png");
        const renderHeightMm = chunkHeightPx / pxPerMm;
        if (pageIndex > 0) {
            pdf.addPage();
        }
        pdf.addImage(pageImgData, "PNG", exportMarginMm, exportMarginMm, contentWidthMm, renderHeightMm);
        yOffset += chunkHeightPx;
        pageIndex += 1;
    }
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
