import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { authenticate, requireAdminMode } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();
router.use(authenticate);

function normalizePetInput(input: Record<string, unknown>): Prisma.PetUpdateInput {
  const payload: Prisma.PetUpdateInput = {};

  if (typeof input.nameEn === "string") {
    payload.nameEn = input.nameEn.trim();
  }
  if (typeof input.nameZh === "string") {
    payload.nameZh = input.nameZh.trim();
  }
  if (typeof input.species === "string") {
    payload.species = input.species.trim();
  }
  if (typeof input.breed === "string") {
    payload.breed = input.breed.trim();
  }
  if (input.gender === "MALE" || input.gender === "FEMALE") {
    payload.gender = input.gender;
  }

  if (typeof input.dob === "string" || input.dob instanceof Date) {
    const date = new Date(input.dob);
    if (Number.isNaN(date.getTime())) {
      throw new HttpError(400, "Invalid date of birth");
    }
    payload.dob = date;
  }

  if (input.weight === null || input.weight === "") {
    payload.weight = null;
  } else if (typeof input.weight === "number") {
    if (!Number.isFinite(input.weight)) {
      throw new HttpError(400, "Invalid weight");
    }
    payload.weight = input.weight;
  } else if (typeof input.weight === "string") {
    const parsed = Number(input.weight);
    if (!Number.isFinite(parsed)) {
      throw new HttpError(400, "Invalid weight");
    }
    payload.weight = parsed;
  }

  return payload;
}

function normalizePetCreateInput(input: Record<string, unknown>): Prisma.PetCreateInput {
  const payload = normalizePetInput(input);

  if (!payload.nameEn || typeof payload.nameEn !== "string") {
    throw new HttpError(400, "nameEn is required");
  }
  if (!payload.nameZh || typeof payload.nameZh !== "string") {
    throw new HttpError(400, "nameZh is required");
  }
  if (!payload.breed || typeof payload.breed !== "string") {
    throw new HttpError(400, "breed is required");
  }
  if (!payload.gender || (payload.gender !== "MALE" && payload.gender !== "FEMALE")) {
    throw new HttpError(400, "gender is required");
  }
  if (!payload.dob || !(payload.dob instanceof Date)) {
    throw new HttpError(400, "dob is required");
  }

  return {
    nameEn: payload.nameEn,
    nameZh: payload.nameZh,
    breed: payload.breed,
    gender: payload.gender,
    dob: payload.dob,
    species: typeof payload.species === "string" ? payload.species : "Cat",
    ...(payload.weight !== undefined ? { weight: payload.weight as number | null } : {})
  };
}

function mapPrismaPetError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new HttpError(404, "Pet not found");
    }
    if (error.code === "P2002") {
      throw new HttpError(409, "Pet name already exists");
    }
  }
  throw error;
}

router.get("/", async (_req, res) => {
  const pets = await prisma.pet.findMany({ where: { isActive: true }, orderBy: { nameEn: "asc" } });
  res.json(pets);
});

router.get("/:id", async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
  if (!pet || !pet.isActive) {
    throw new HttpError(404, "Pet not found");
  }
  res.json(pet);
});

router.post("/", async (req, res) => {
  try {
    const pet = await prisma.pet.create({ data: normalizePetCreateInput(req.body as Record<string, unknown>) });
    res.status(201).json(pet);
  } catch (error) {
    mapPrismaPetError(error);
  }
});

router.put("/:id", requireAdminMode, async (req, res) => {
  try {
    const data = normalizePetInput(req.body as Record<string, unknown>);
    const pet = await prisma.pet.update({ where: { id: req.params.id }, data });
    res.json(pet);
  } catch (error) {
    mapPrismaPetError(error);
  }
});

router.delete("/:id", requireAdminMode, async (req, res) => {
  await prisma.pet.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true });
});

export default router;
