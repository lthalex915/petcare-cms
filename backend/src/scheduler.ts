import cron from "node-cron";
import { FoodType, ReportType } from "@prisma/client";
import { getPrismaFeatures, prisma } from "./prisma.js";
import { ReportGeneratorService } from "./services/report-generator.js";

async function findAdminUserId() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, orderBy: { createdAt: "asc" } });
  return admin?.id;
}

function toDateOnlyParts(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function ensureAutoFeederRecordForDate(date: Date, userId: string) {
  const features = await getPrismaFeatures();
  const feedingGramsField = features.feedingGramsField;
  const autoFeederSettingDelegate = (prisma as any).autoFeederSetting as {
    findUnique: (args: { where: { id: string }; select: Record<string, unknown> }) => Promise<any>;
  };

  const setting = await autoFeederSettingDelegate.findUnique({
    where: { id: "default" },
    select: {
      enabled: true,
      foodType: true,
      foodBrand: true,
      amountGrams: true,
      ...(features.autoFeederFlavor ? { flavor: true } : {})
    }
  });
  if (!setting?.enabled) {
    return;
  }

  const feedingRecordDelegate = (prisma as any).feedingRecord as {
    findFirst: (args: { where: Record<string, unknown>; select: Record<string, unknown> }) => Promise<any>;
    create: (args: { data: Record<string, unknown> }) => Promise<any>;
  };

  const activePets = await prisma.pet.findMany({ where: { isActive: true }, orderBy: { nameEn: "asc" } });
  if (activePets.length === 0) {
    return;
  }

  const dateText = toDateOnlyParts(date);
  const start = new Date(`${dateText}T00:00:00.000Z`);
  const end = new Date(`${dateText}T23:59:59.999Z`);
  const existingLog = await prisma.dailyLog.findFirst({ where: { date: { gte: start, lte: end } } });
  const log = existingLog ?? await prisma.dailyLog.create({ data: { date: start, createdById: userId } });

  const existingAutoRecord = await feedingRecordDelegate.findFirst({
    where: {
      dailyLogId: log.id,
      isAutoFeeder: true,
      notes: { contains: "AUTO_FEEDER_DAILY" }
    },
    select: { id: true }
  });
  if (existingAutoRecord) {
    return;
  }

  const petIds = activePets.map((pet) => pet.id);
  await feedingRecordDelegate.create({
    data: {
      dailyLogId: log.id,
      petId: petIds[0],
      mealTime: new Date(`${dateText}T07:00:00.000Z`),
      foodType: (setting.foodType as FoodType) || FoodType.DRY,
      wetFoodBrand: setting.foodBrand || null,
      ...(features.feedingFlavor ? { flavor: setting.flavor || null } : {}),
      [feedingGramsField]: typeof setting.amountGrams === "number" ? setting.amountGrams : null,
      isAutoFeeder: true,
      consumedBy: petIds,
      notes: "AUTO_FEEDER_DAILY: Food provided by 自動餵食器"
    }
  });
}

export function initializeScheduler() {
  const generator = new ReportGeneratorService();

  cron.schedule("5 0 * * *", async () => {
    const adminId = await findAdminUserId();
    if (!adminId) {
      return;
    }
    await ensureAutoFeederRecordForDate(new Date(), adminId);
  });

  cron.schedule("0 22 * * *", async () => {
    const adminId = await findAdminUserId();
    if (!adminId) {
      return;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await generator.generate(ReportType.DAILY, adminId, yesterday.toISOString().slice(0, 10));
  });

  cron.schedule("0 22 * * 6", async () => {
    const adminId = await findAdminUserId();
    if (!adminId) {
      return;
    }
    const today = new Date();
    await generator.generate(ReportType.WEEKLY, adminId, today.toISOString().slice(0, 10));
  });

  cron.schedule("0 22 28-31 * *", async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (tomorrow.getMonth() === now.getMonth()) {
      return;
    }

    const adminId = await findAdminUserId();
    if (!adminId) {
      return;
    }

    await generator.generate(ReportType.MONTHLY, adminId, now.toISOString().slice(0, 10));
  });
}
