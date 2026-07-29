import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { authenticate, signToken } from "../middleware/auth.js";
import { config } from "../config.js";

const router = Router();
const revokedTokens = new Set<string>();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    throw new HttpError(400, "Username and password are required");
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) {
    throw new HttpError(401, "Invalid credentials");
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    }
  });
});

router.post("/refresh", async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    throw new HttpError(400, "Token is required");
  }
  if (revokedTokens.has(token)) {
    throw new HttpError(401, "Token revoked");
  }

  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
  } catch {
    throw new HttpError(401, "Invalid token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId as string } });
  if (!user || !user.isActive) {
    throw new HttpError(401, "Invalid token user");
  }

  const nextToken = signToken({ userId: user.id, username: user.username, role: user.role });
  res.json({ token: nextToken });
});

router.post("/logout", authenticate, (req, res) => {
  if (req.token) {
    revokedTokens.add(req.token);
  }
  res.json({ success: true });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive
  });
});

export default router;
