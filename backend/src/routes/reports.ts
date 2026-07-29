import { Router } from "express";
import { ReportType } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { prisma } from "../prisma.js";
import { ReportGeneratorService } from "../services/report-generator.js";

const router = Router();
const generator = new ReportGeneratorService();
router.use(authenticate);

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
  const { type, date } = req.body as { type?: ReportType; date?: string };
  if (!type || !Object.values(ReportType).includes(type)) {
    throw new HttpError(400, "Invalid report type");
  }

  const report = await generator.generate(type, req.user!.userId, date);
  res.status(201).json(report);
});

router.delete("/:id", async (req, res) => {
  await prisma.report.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
