import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getPrismaFeatures, prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

router.get("/weight", async (req, res) => {
  const petId = String(req.query.petId ?? "");
  const start = req.query.start ? new Date(String(req.query.start)) : new Date("1970-01-01");
  const end = req.query.end ? new Date(String(req.query.end)) : new Date("2999-01-01");

  const rows = await prisma.healthRecord.findMany({
    where: {
      ...(petId ? { petId } : {}),
      dailyLog: { date: { gte: start, lte: end } },
      weightKg: { not: null }
    },
    include: { dailyLog: true, pet: true },
    orderBy: { dailyLog: { date: "asc" } }
  });

  res.json(rows.map((r) => ({ date: r.dailyLog.date, petId: r.petId, petName: r.pet.nameEn, weightKg: r.weightKg })));
});

router.get("/feeding", async (req, res) => {
  const features = await getPrismaFeatures();
  const start = req.query.start ? new Date(String(req.query.start)) : new Date("1970-01-01");
  const end = req.query.end ? new Date(String(req.query.end)) : new Date("2999-01-01");

  const rows = await prisma.feedingRecord.findMany({
    where: { dailyLog: { date: { gte: start, lte: end } } },
    select: {
      id: true,
      wetFoodBrand: true,
      wetFoodQty: true,
      foodGrams: true,
      ...(features.feedingFlavor ? { flavor: true } : {})
    }
  });

  const byBrand = rows.reduce<Record<string, { count: number; wetQty: number; foodGrams: number }>>((acc, row) => {
    const brand = row.wetFoodBrand ?? "Unknown";
    if (!acc[brand]) {
      acc[brand] = { count: 0, wetQty: 0, foodGrams: 0 };
    }
    acc[brand].count += 1;
    acc[brand].wetQty += row.wetFoodQty ?? 0;
    acc[brand].foodGrams += row.foodGrams ?? 0;
    return acc;
  }, {});

  res.json(Object.entries(byBrand).map(([brand, value]) => ({ brand, ...value })));
});

router.get("/health", async (req, res) => {
  const petId = String(req.query.petId ?? "");
  const start = req.query.start ? new Date(String(req.query.start)) : new Date("1970-01-01");
  const end = req.query.end ? new Date(String(req.query.end)) : new Date("2999-01-01");

  const rows = await prisma.healthRecord.findMany({
    where: {
      ...(petId ? { petId } : {}),
      dailyLog: { date: { gte: start, lte: end } }
    },
    include: { dailyLog: true, pet: true },
    orderBy: { dailyLog: { date: "asc" } }
  });

  res.json(rows.map((r) => ({
    date: r.dailyLog.date,
    petId: r.petId,
    petName: r.pet.nameEn,
    appetite: r.appetite,
    mood: r.mood,
    stool: r.stool,
    vomit: r.vomit
  })));
});

router.get("/activity", async (req, res) => {
  const petId = String(req.query.petId ?? "");
  const start = req.query.start ? new Date(String(req.query.start)) : new Date("1970-01-01");
  const end = req.query.end ? new Date(String(req.query.end)) : new Date("2999-01-01");

  const rows = await prisma.activityRecord.findMany({
    where: {
      ...(petId ? { petId } : {}),
      dailyLog: { date: { gte: start, lte: end } }
    },
    include: { dailyLog: true, pet: true }
  });

  res.json(rows.map((r) => ({
    date: r.dailyLog.date,
    petId: r.petId,
    petName: r.pet.nameEn,
    activityType: r.activityType,
    durationMin: r.durationMin ?? 0
  })));
});

export default router;
