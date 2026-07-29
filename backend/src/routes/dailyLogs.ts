import { Router } from "express";
import { ActivityType, AppetiteLevel, FoodType, Mood, Severity, StoolType, SupplyType } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

function parseDateOnly(dateString: string): Date {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, "Invalid date format. Expected YYYY-MM-DD");
  }
  return date;
}

function dayRange(dateString: string) {
  const start = parseDateOnly(dateString);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function getLogByDate(dateString: string) {
  const { start, end } = dayRange(dateString);
  const log = await prisma.dailyLog.findFirst({
    where: { date: { gte: start, lt: end } },
    include: {
      feedings: true,
      health: true,
      activities: true,
      incidents: true,
      litterBoxes: true,
      supplies: true,
      diaryEntries: true
    }
  });
  return log;
}

async function ensureLog(dateString: string, userId: string) {
  const existing = await getLogByDate(dateString);
  if (existing) {
    return existing;
  }
  const created = await prisma.dailyLog.create({
    data: {
      date: parseDateOnly(dateString),
      createdById: userId
    }
  });
  return created;
}

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = 20;
  const start = req.query.start ? parseDateOnly(String(req.query.start)) : undefined;
  const end = req.query.end ? parseDateOnly(String(req.query.end)) : undefined;

  const logs = await prisma.dailyLog.findMany({
    where: {
      ...(start || end
        ? {
            date: {
              ...(start ? { gte: start } : {}),
              ...(end ? { lte: end } : {})
            }
          }
        : {})
    },
    include: {
      createdBy: { select: { id: true, username: true, displayName: true } }
    },
    orderBy: { date: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  res.json(logs);
});

router.get("/today", async (_req, res) => {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const log = await getLogByDate(`${yyyy}-${mm}-${dd}`);
  res.json(log ?? null);
});

router.get("/:date", async (req, res) => {
  const log = await getLogByDate(req.params.date);
  if (!log) {
    throw new HttpError(404, "Daily log not found");
  }
  res.json(log);
});

router.post("/", async (req, res) => {
  const { date, summary } = req.body as { date?: string; summary?: string };
  if (!date) {
    throw new HttpError(400, "date is required");
  }

  const targetDate = parseDateOnly(date);
  const existing = await prisma.dailyLog.findUnique({ where: { date: targetDate } });
  const log = existing
    ? await prisma.dailyLog.update({ where: { id: existing.id }, data: { summary } })
    : await prisma.dailyLog.create({ data: { date: targetDate, summary, createdById: req.user!.userId } });

  res.json(log);
});

router.delete("/:date", async (req, res) => {
  const log = await getLogByDate(req.params.date);
  if (!log) {
    throw new HttpError(404, "Daily log not found");
  }
  await prisma.dailyLog.delete({ where: { id: log.id } });
  res.json({ success: true });
});

const resourceConfig = {
  feedings: {
    delegate: prisma.feedingRecord,
    include: { pet: true },
    transform: (data: Record<string, unknown>) => ({
      ...data,
      mealTime: data.mealTime ? new Date(String(data.mealTime)) : new Date()
    })
  },
  health: {
    delegate: prisma.healthRecord,
    include: { pet: true },
    transform: (data: Record<string, unknown>) => data
  },
  activities: {
    delegate: prisma.activityRecord,
    include: { pet: true },
    transform: (data: Record<string, unknown>) => ({
      ...data,
      startTime: data.startTime ? new Date(String(data.startTime)) : null
    })
  },
  incidents: {
    delegate: prisma.incidentRecord,
    include: { pet: true },
    transform: (data: Record<string, unknown>) => data
  },
  "litter-box": {
    delegate: prisma.litterBoxRecord,
    include: undefined,
    transform: (data: Record<string, unknown>) => data
  },
  supplies: {
    delegate: prisma.supplyRecord,
    include: undefined,
    transform: (data: Record<string, unknown>) => data
  },
  diary: {
    delegate: prisma.diaryEntry,
    include: { pet: true },
    transform: (data: Record<string, unknown>) => data
  }
} as const;

type ResourceKey = keyof typeof resourceConfig;

function validateEnums(resource: ResourceKey, data: Record<string, unknown>) {
  if (resource === "feedings" && data.foodType && !Object.values(FoodType).includes(data.foodType as FoodType)) {
    throw new HttpError(400, "Invalid foodType");
  }
  if (resource === "health") {
    if (data.appetite && !Object.values(AppetiteLevel).includes(data.appetite as AppetiteLevel)) {
      throw new HttpError(400, "Invalid appetite");
    }
    if (data.mood && !Object.values(Mood).includes(data.mood as Mood)) {
      throw new HttpError(400, "Invalid mood");
    }
    if (data.stool && !Object.values(StoolType).includes(data.stool as StoolType)) {
      throw new HttpError(400, "Invalid stool");
    }
  }
  if (resource === "activities" && data.activityType && !Object.values(ActivityType).includes(data.activityType as ActivityType)) {
    throw new HttpError(400, "Invalid activityType");
  }
  if (resource === "incidents" && data.severity && !Object.values(Severity).includes(data.severity as Severity)) {
    throw new HttpError(400, "Invalid severity");
  }
  if (resource === "supplies" && data.supplyType && !Object.values(SupplyType).includes(data.supplyType as SupplyType)) {
    throw new HttpError(400, "Invalid supplyType");
  }
}

router.get("/:date/:resource", async (req, res) => {
  const resource = req.params.resource as ResourceKey;
  if (!(resource in resourceConfig)) {
    throw new HttpError(404, "Resource not found");
  }

  const log = await getLogByDate(req.params.date);
  if (!log) {
    return res.json([]);
  }

  const cfg = resourceConfig[resource];
  const rows = await cfg.delegate.findMany({
    where: { dailyLogId: log.id },
    ...(cfg.include ? { include: cfg.include } : {})
  });
  res.json(rows);
});

router.post("/:date/:resource", async (req, res) => {
  const resource = req.params.resource as ResourceKey;
  if (!(resource in resourceConfig)) {
    throw new HttpError(404, "Resource not found");
  }

  const cfg = resourceConfig[resource];
  const log = await ensureLog(req.params.date, req.user!.userId);
  const input = req.body as Record<string, unknown>;
  validateEnums(resource, input);

  const created = await cfg.delegate.create({
    data: {
      dailyLogId: log.id,
      ...cfg.transform(input)
    }
  });
  res.status(201).json(created);
});

router.put("/:date/:resource/:id", async (req, res) => {
  const resource = req.params.resource as ResourceKey;
  if (!(resource in resourceConfig)) {
    throw new HttpError(404, "Resource not found");
  }

  const cfg = resourceConfig[resource];
  const input = req.body as Record<string, unknown>;
  validateEnums(resource, input);

  const updated = await cfg.delegate.update({
    where: { id: req.params.id },
    data: cfg.transform(input)
  });
  res.json(updated);
});

router.delete("/:date/:resource/:id", async (req, res) => {
  const resource = req.params.resource as ResourceKey;
  if (!(resource in resourceConfig)) {
    throw new HttpError(404, "Resource not found");
  }

  const cfg = resourceConfig[resource];
  await cfg.delegate.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
