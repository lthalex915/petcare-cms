import { Prisma, ReportType } from "@prisma/client";
import { getPrismaFeatures, prisma } from "../prisma.js";
import { LlmService } from "./llm-service.js";

function getPeriod(type: ReportType, dateInput?: string) {
  const base = dateInput ? new Date(dateInput) : new Date();
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);

  if (type === ReportType.DAILY) {
    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (type === ReportType.WEEKLY) {
    const start = new Date(base);
    start.setDate(base.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function buildFallbackHtml(type: ReportType, periodStart: Date, periodEnd: Date): string {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${type} Clinical Report</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #F5F5F5; padding: 20px; }
    #clinical-report { max-width: 210mm; margin: 0 auto; background: #FFF; padding: 30px; box-shadow: 0 2px 16px rgba(0,0,0,0.1); }
    h1, h2 { color: #000; }
    .exec-summary { border-left: 3px solid #333; padding-left: 12px; }
    .rec-box { background: #F9F9F9; border: 1px solid #333; padding: 12px; margin-top: 12px; }
  </style>
  </head>
  <body>
  <div id="clinical-report">
    <h1>${type} CLINICAL REPORT</h1>
    <p>${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)}</p>
    <div class="exec-summary">
      <h2>EXECUTIVE SUMMARY</h2>
      <p>Report content was generated from available records. Configure API key in settings to enable full AI report generation.</p>
    </div>
    <div class="rec-box">
      <h2>RECOMMENDATIONS</h2>
      <ol><li>Review daily records for completeness.</li><li>Configure active LLM API key to generate full narrative reports.</li></ol>
    </div>
  </div>
  </body>
  </html>`;
}

function hasClosingHtmlTag(html: string): boolean {
  return html.trimEnd().toLowerCase().endsWith("</html>");
}

function looksLikeCompleteHtmlFragment(html: string): boolean {
  const normalized = html.trim();
  const lower = normalized.toLowerCase();
  return lower.includes("<div id=\"clinical-report\"") && lower.endsWith("</div>");
}

function wrapHtmlFragmentAsDocument(htmlFragment: string, type: ReportType): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${type} Clinical Report</title>
</head>
<body>
${htmlFragment.trim()}
</body>
</html>`;
}

function normalizeGeneratedHtml(rawHtml: string): string {
  let html = rawHtml.trim();

  if (html.startsWith("```")) {
    html = html.replace(/^```[a-zA-Z0-9_-]*\s*/, "").replace(/\s*```\s*$/, "").trim();
  }

  const lower = html.toLowerCase();
  const endIndex = lower.lastIndexOf("</html>");
  if (endIndex === -1) {
    return html;
  }

  const doctypeIndex = lower.search(/<!doctype\s+html>/i);
  const htmlTagIndex = lower.search(/<html\b/i);
  const startIndex = doctypeIndex >= 0 ? doctypeIndex : htmlTagIndex;

  if (startIndex >= 0) {
    return html.slice(startIndex, endIndex + "</html>".length).trim();
  }

  return html.slice(0, endIndex + "</html>".length).trim();
}

export class ReportGeneratorService {
  private llm = new LlmService();

  async generate(type: ReportType, generatedById: string, date?: string) {
    console.log("[ReportGenerator] Starting report generation", {
      type,
      generatedById,
      date: date ?? null
    });

    const features = await getPrismaFeatures();
    const { start, end } = getPeriod(type, date);

    const logs = await prisma.dailyLog.findMany({
      where: { date: { gte: start, lte: end } },
      include: {
        feedings: {
          select: {
            id: true,
            dailyLogId: true,
            petId: true,
            mealTime: true,
            foodType: true,
            wetFoodBrand: true,
            ...(features.feedingFlavor ? { flavor: true } : {}),
            wetFoodQty: true,
            dryFoodGrams: true,
            isAutoFeeder: true,
            consumedBy: true,
            notes: true,
            createdAt: true
          }
        },
        health: true,
        activities: true,
        incidents: true,
        litterBoxes: true,
        supplies: true,
        diaryEntries: true
      },
      orderBy: { date: "asc" }
    });

    const pets = await prisma.pet.findMany({ where: { isActive: true }, orderBy: { nameEn: "asc" } });

    const rawData = {
      reportType: type,
      periodStart: start,
      periodEnd: end,
      generatedAt: new Date(),
      petRoster: pets,
      sections: {
        feeding: logs.flatMap((l) => l.feedings),
        health: logs.flatMap((l) => l.health),
        activities: logs.flatMap((l) => l.activities),
        incidents: logs.flatMap((l) => l.incidents),
        litterBox: logs.flatMap((l) => l.litterBoxes),
        supplies: logs.flatMap((l) => l.supplies),
        diary: logs.flatMap((l) => l.diaryEntries)
      },
      aggregates: {
        totalLogs: logs.length,
        totalFeedings: logs.reduce((acc, l) => acc + l.feedings.length, 0),
        totalIncidents: logs.reduce((acc, l) => acc + l.incidents.length, 0)
      }
    };

    const rawDataJson = JSON.parse(JSON.stringify(rawData)) as Prisma.InputJsonValue;

    let htmlContent = "";
    let generationSource: "llm" | "fallback" = "llm";
    try {
      console.log("[ReportGenerator] Calling LLM for report HTML", {
        type,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        totalLogs: logs.length,
        totalPets: pets.length
      });
      const llmHtmlContent = await this.llm.generateReport(rawData);
      htmlContent = normalizeGeneratedHtml(llmHtmlContent);
      let validHtml = hasClosingHtmlTag(htmlContent);
      let wrappedFragment = false;

      if (!validHtml && looksLikeCompleteHtmlFragment(htmlContent)) {
        htmlContent = wrapHtmlFragmentAsDocument(htmlContent, type);
        validHtml = hasClosingHtmlTag(htmlContent);
        wrappedFragment = true;
      }

      console.log("[ReportGenerator] LLM report received", {
        type,
        originalLength: llmHtmlContent.length,
        normalizedLength: htmlContent.length,
        normalized: llmHtmlContent.length !== htmlContent.length,
        wrappedFragment,
        endsWithClosingHtmlTag: validHtml
      });
      if (!validHtml) {
        throw new Error("Generated report did not end with </html>");
      }
    } catch (error) {
      generationSource = "fallback";
      console.error("[ReportGenerator] Falling back to default report HTML", {
        type,
        reason: error instanceof Error ? error.message : String(error)
      });
      htmlContent = buildFallbackHtml(type, start, end);
    }

    const report = await prisma.report.create({
      data: {
        type,
        periodStart: start,
        periodEnd: end,
        title: `${type} Clinical Report (${start.toISOString().slice(0, 10)} - ${end.toISOString().slice(0, 10)})`,
        htmlContent,
        rawData: rawDataJson,
        generatedById,
        petIds: pets.map((p) => p.id)
      }
    });

    console.log("[ReportGenerator] Report saved", {
      reportId: report.id,
      type,
      source: generationSource,
      htmlLength: report.htmlContent.length,
      endsWithClosingHtmlTag: hasClosingHtmlTag(report.htmlContent)
    });

    return report;
  }
}
