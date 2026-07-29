import { Router } from "express";
import { ReportType } from "@prisma/client";
import { authenticate, requireAdminMode } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { prisma } from "../prisma.js";
import { ReportGeneratorService } from "../services/report-generator.js";

const router = Router();
const generator = new ReportGeneratorService();
router.use(authenticate);

function parseDateOnlyInput(value: string, field: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${field} must be YYYY-MM-DD`);
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, `${field} must be YYYY-MM-DD`);
  }

  return parsed;
}

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = 20;
  const type = req.query.type as ReportType | undefined;

  const reports = await prisma.report.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      type: true,
      title: true,
      periodStart: true,
      periodEnd: true,
      createdAt: true
    }
  });

  res.json(reports);
});

router.get("/:id", async (req, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) {
    throw new HttpError(404, "Report not found");
  }
  res.json(report);
});

router.post("/generate", async (req, res) => {
  const { type, date, startDate, endDate } = req.body as {
    type?: ReportType;
    date?: string;
    startDate?: string;
    endDate?: string;
  };
  if (!type || !Object.values(ReportType).includes(type)) {
    throw new HttpError(400, "Invalid report type");
  }

  if (date !== undefined && typeof date !== "string") {
    throw new HttpError(400, "date must be YYYY-MM-DD");
  }

  if (startDate !== undefined && typeof startDate !== "string") {
    throw new HttpError(400, "startDate must be YYYY-MM-DD");
  }

  if (endDate !== undefined && typeof endDate !== "string") {
    throw new HttpError(400, "endDate must be YYYY-MM-DD");
  }

  if ((startDate && !endDate) || (!startDate && endDate)) {
    throw new HttpError(400, "Both startDate and endDate are required for range reports");
  }

  if (date) {
    parseDateOnlyInput(date, "date");
  }

  if (startDate && endDate) {
    const start = parseDateOnlyInput(startDate, "startDate");
    const end = parseDateOnlyInput(endDate, "endDate");
    if (start.getTime() > end.getTime()) {
      throw new HttpError(400, "startDate must be on or before endDate");
    }
  }

  const report = await generator.generate(type, req.user!.userId, {
    date,
    startDate,
    endDate
  });
  res.status(201).json(report);
});

router.put("/:id", requireAdminMode, async (req, res) => {
  const { title, htmlContent } = req.body as { title?: string; htmlContent?: string };
  const report = await prisma.report.update({
    where: { id: req.params.id },
    data: {
      ...(typeof title === "string" ? { title } : {}),
      ...(typeof htmlContent === "string" ? { htmlContent } : {})
    }
  });
  res.json(report);
});

router.delete("/:id", requireAdminMode, async (req, res) => {
  await prisma.report.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
