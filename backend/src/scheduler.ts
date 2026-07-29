import cron from "node-cron";
import { ReportType } from "@prisma/client";
import { prisma } from "./prisma.js";
import { ReportGeneratorService } from "./services/report-generator.js";

async function findAdminUserId() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, orderBy: { createdAt: "asc" } });
  return admin?.id;
}

export function initializeScheduler() {
  const generator = new ReportGeneratorService();

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
