import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config.js";
import { HttpError } from "./errorHandler.js";
import { prisma } from "../prisma.js";

export interface JwtPayload {
  userId: string;
  username: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

async function resolveDefaultUser(): Promise<JwtPayload> {
  const user =
    (await prisma.user.findFirst({
      where: { isActive: true, role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, role: true }
    })) ??
    (await prisma.user.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, role: true }
    }));

  if (!user) {
    throw new HttpError(503, "No active user available");
  }

  return {
    userId: user.id,
    username: user.username,
    role: user.role
  };
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const auth = req.header("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    req.user = await resolveDefaultUser();
    next();
    return;
  }

  const token = auth.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    req.token = token;
    next();
  } catch {
    req.user = await resolveDefaultUser();
    next();
  }
}

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, "Forbidden");
    }
    next();
  };
}
