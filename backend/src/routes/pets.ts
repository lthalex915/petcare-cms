import { Router } from "express";
import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";

const router = Router();
router.use(authenticate);

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
  const pet = await prisma.pet.create({ data: req.body });
  res.status(201).json(pet);
});

router.put("/:id", async (req, res) => {
  const pet = await prisma.pet.update({ where: { id: req.params.id }, data: req.body });
  res.json(pet);
});

router.delete("/:id", async (req, res) => {
  await prisma.pet.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true });
});

export default router;
