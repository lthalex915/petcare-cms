import { Router } from "express";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireRole([Role.ADMIN]));

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  res.json(users.map((u) => ({ id: u.id, username: u.username, displayName: u.displayName, role: u.role, isActive: u.isActive, createdAt: u.createdAt })));
});

router.post("/", async (req, res) => {
  const { username, password, displayName, role } = req.body as { username: string; password: string; displayName: string; role: Role };
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: bcrypt.hashSync(password, 10),
      displayName,
      role
    }
  });
  res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role, isActive: user.isActive });
});

router.put("/:id", async (req, res) => {
  const { password, ...rest } = req.body as { password?: string; displayName?: string; role?: Role; isActive?: boolean };
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(password ? { passwordHash: bcrypt.hashSync(password, 10) } : {})
    }
  });
  res.json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role, isActive: user.isActive });
});

router.delete("/:id", async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true });
});

export default router;
