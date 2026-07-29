import { Prisma, Role } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { authenticate, requireAdminMode, requireRole } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { prisma } from "../prisma.js";

type DbmsRow = Record<string, unknown>;

type TableConfig = {
  label: string;
  delegate?: {
    count: () => Promise<number>;
    findMany: (args: { skip: number; take: number; orderBy: Record<string, "asc" | "desc"> }) => Promise<DbmsRow[]>;
    create: (args: { data: DbmsRow }) => Promise<DbmsRow>;
    update: (args: { where: { id: string }; data: DbmsRow }) => Promise<DbmsRow>;
    delete: (args: { where: { id: string } }) => Promise<DbmsRow>;
  };
  orderBy: Record<string, "asc" | "desc">;
  sanitize: (row: DbmsRow) => DbmsRow;
  normalizeCreate?: (row: DbmsRow) => Promise<DbmsRow>;
  normalizeUpdate?: (row: DbmsRow) => Promise<DbmsRow>;
  deleteById?: (id: string) => Promise<void>;
};

type TableSummary = {
  key: string;
  label: string;
  count: number;
  available: boolean;
  warning?: string;
};

function isTableDelegate(value: unknown): value is TableConfig["delegate"] {
  if (!value || typeof value !== "object") {
    return false;
  }
  const maybeDelegate: Partial<NonNullable<TableConfig["delegate"]>> = value as Partial<NonNullable<TableConfig["delegate"]>>;
  return (
    typeof maybeDelegate.count === "function"
    && typeof maybeDelegate.findMany === "function"
    && typeof maybeDelegate.create === "function"
    && typeof maybeDelegate.update === "function"
    && typeof maybeDelegate.delete === "function"
  );
}

function getDelegate(delegate: unknown): TableConfig["delegate"] {
  if (isTableDelegate(delegate)) {
    return delegate;
  }
  return undefined;
}

function maskApiKey(apiKey: string): string {
  if (!apiKey) {
    return "";
  }
  if (apiKey.length <= 8) {
    return "*".repeat(apiKey.length);
  }
  return `${apiKey.slice(0, 4)}${"*".repeat(Math.max(4, apiKey.length - 8))}${apiKey.slice(-4)}`;
}

function userSanitizer(row: DbmsRow): DbmsRow {
  const { passwordHash, ...safe } = row;
  return safe;
}

function llmConfigSanitizer(row: DbmsRow): DbmsRow {
  const safe = { ...row };
  if (typeof safe.apiKey === "string") {
    safe.apiKey = maskApiKey(safe.apiKey);
  }
  return safe;
}

async function normalizeUserCreate(row: DbmsRow): Promise<DbmsRow> {
  const payload = { ...row };

  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const displayName = typeof payload.displayName === "string" ? payload.displayName.trim() : "";
  const role = payload.role;
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!username || !displayName || !password) {
    throw new HttpError(400, "users create requires username, displayName, and password");
  }

  if (role !== Role.ADMIN && role !== Role.STAFF && role !== Role.VIEWER) {
    throw new HttpError(400, "users create requires valid role");
  }

  delete payload.password;
  delete payload.passwordHash;

  return {
    ...payload,
    username,
    displayName,
    role,
    passwordHash: bcrypt.hashSync(password, 10)
  };
}

async function normalizeUserUpdate(row: DbmsRow): Promise<DbmsRow> {
  const payload = { ...row };
  const password = typeof payload.password === "string" ? payload.password : "";

  if (password) {
    payload.passwordHash = bcrypt.hashSync(password, 10);
  }

  delete payload.password;

  if (payload.role && payload.role !== Role.ADMIN && payload.role !== Role.STAFF && payload.role !== Role.VIEWER) {
    throw new HttpError(400, "users update contains invalid role");
  }

  return payload;
}

async function softDeleteUser(id: string): Promise<void> {
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target) {
    throw new HttpError(404, "Row not found");
  }

  if (target.role === Role.ADMIN && target.isActive) {
    const activeAdmins = await prisma.user.count({ where: { role: Role.ADMIN, isActive: true } });
    if (activeAdmins <= 1) {
      throw new HttpError(409, "Cannot disable the last active admin user");
    }
  }

  await prisma.user.update({ where: { id }, data: { isActive: false } });
}

async function softDeletePet(id: string): Promise<void> {
  await prisma.pet.update({ where: { id }, data: { isActive: false } });
}

function isMissingRelationError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021";
  }
  if (error instanceof Error) {
    return /does not exist|table.*not found/i.test(error.message);
  }
  return false;
}

async function getTableSummary(key: string, config: TableConfig): Promise<TableSummary> {
  if (!config.delegate) {
    return {
      key,
      label: config.label,
      count: 0,
      available: false,
      warning: "Prisma client does not expose this model (run prisma generate)"
    };
  }

  try {
    const count = await config.delegate.count();
    return {
      key,
      label: config.label,
      count,
      available: true
    };
  } catch (error) {
    if (isMissingRelationError(error)) {
      return {
        key,
        label: config.label,
        count: 0,
        available: false,
        warning: "Database table is not available in current schema"
      };
    }
    throw error;
  }
}

const tableConfigs: Record<string, TableConfig> = {
  users: {
    label: "Users",
    delegate: getDelegate(prisma.user),
    orderBy: { createdAt: "desc" },
    sanitize: userSanitizer,
    normalizeCreate: normalizeUserCreate,
    normalizeUpdate: normalizeUserUpdate,
    deleteById: softDeleteUser
  },
  pets: {
    label: "Pets",
    delegate: getDelegate(prisma.pet),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row,
    deleteById: softDeletePet
  },
  dailyLogs: {
    label: "Daily Logs",
    delegate: getDelegate(prisma.dailyLog),
    orderBy: { date: "desc" },
    sanitize: (row) => row
  },
  feedingRecords: {
    label: "Feeding Records",
    delegate: getDelegate(prisma.feedingRecord),
    orderBy: { mealTime: "desc" },
    sanitize: (row) => row
  },
  healthRecords: {
    label: "Health Records",
    delegate: getDelegate(prisma.healthRecord),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row
  },
  activityRecords: {
    label: "Activity Records",
    delegate: getDelegate(prisma.activityRecord),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row
  },
  incidentRecords: {
    label: "Incident Records",
    delegate: getDelegate(prisma.incidentRecord),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row
  },
  litterBoxRecords: {
    label: "Litter Box Records",
    delegate: getDelegate(prisma.litterBoxRecord),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row
  },
  supplyRecords: {
    label: "Supply Records",
    delegate: getDelegate(prisma.supplyRecord),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row
  },
  diaryEntries: {
    label: "Diary Entries",
    delegate: getDelegate(prisma.diaryEntry),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row
  },
  reports: {
    label: "Reports",
    delegate: getDelegate(prisma.report),
    orderBy: { createdAt: "desc" },
    sanitize: (row) => row
  },
  llmConfigs: {
    label: "LLM Configs",
    delegate: getDelegate(prisma.llmConfig),
    orderBy: { updatedAt: "desc" },
    sanitize: llmConfigSanitizer
  },
  autoFeederSettings: {
    label: "Auto Feeder Settings",
    delegate: getDelegate(prisma.autoFeederSetting),
    orderBy: { updatedAt: "desc" },
    sanitize: (row) => row
  }
};

const router = Router();
router.use(authenticate, requireRole([Role.ADMIN]));

function ensurePayload(value: unknown): DbmsRow {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Payload must be a JSON object");
  }
  return value as DbmsRow;
}

function mapDbmsWriteError(error: unknown): never {
  if (error instanceof HttpError) {
    throw error;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new HttpError(404, "Row not found");
    }
    if (error.code === "P2002") {
      throw new HttpError(409, "Unique constraint violated");
    }
    if (error.code === "P2003") {
      throw new HttpError(409, "Foreign key constraint violated");
    }
  }
  if (error instanceof Error) {
    throw new HttpError(400, error.message);
  }
  throw new HttpError(500, "Failed to process DBMS write operation");
}

router.get("/tables", async (_req, res) => {
  const entries = await Promise.all(Object.entries(tableConfigs).map(([key, config]) => getTableSummary(key, config)));

  res.json(entries);
});

router.get("/table/:key", async (req, res) => {
  const config = tableConfigs[req.params.key];
  if (!config) {
    return res.status(404).json({ message: "Unknown table key" });
  }

  if (!config.delegate) {
    return res.status(409).json({
      message: "This table is not available in the current Prisma client. Run prisma generate and restart backend."
    });
  }

  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 25)));
  const skip = (page - 1) * pageSize;

  let total: number;
  let rows: DbmsRow[];

  try {
    [total, rows] = await Promise.all([
      config.delegate.count(),
      config.delegate.findMany({
        skip,
        take: pageSize,
        orderBy: config.orderBy
      })
    ]);
  } catch (error) {
    if (isMissingRelationError(error)) {
      return res.status(409).json({
        message: "This table is not available in the current database schema"
      });
    }
    throw error;
  }

  res.json({
    key: req.params.key,
    label: config.label,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    rows: rows.map((row) => config.sanitize(row))
  });
});

router.post("/table/:key", requireAdminMode, async (req, res) => {
  const config = tableConfigs[req.params.key];
  if (!config) {
    throw new HttpError(404, "Unknown table key");
  }
  if (!config.delegate) {
    throw new HttpError(409, "This table is not available in the current Prisma client");
  }

  try {
    const payload = ensurePayload(req.body);
    const data = config.normalizeCreate ? await config.normalizeCreate(payload) : payload;
    const created = await config.delegate.create({ data });
    res.status(201).json(config.sanitize(created));
  } catch (error) {
    mapDbmsWriteError(error);
  }
});

router.put("/table/:key/:id", requireAdminMode, async (req, res) => {
  const config = tableConfigs[req.params.key];
  if (!config) {
    throw new HttpError(404, "Unknown table key");
  }
  if (!config.delegate) {
    throw new HttpError(409, "This table is not available in the current Prisma client");
  }

  try {
    const payload = ensurePayload(req.body);
    const data = config.normalizeUpdate ? await config.normalizeUpdate(payload) : payload;
    const updated = await config.delegate.update({ where: { id: req.params.id }, data });
    res.json(config.sanitize(updated));
  } catch (error) {
    mapDbmsWriteError(error);
  }
});

router.delete("/table/:key/:id", requireAdminMode, async (req, res) => {
  const config = tableConfigs[req.params.key];
  if (!config) {
    throw new HttpError(404, "Unknown table key");
  }
  if (!config.delegate) {
    throw new HttpError(409, "This table is not available in the current Prisma client");
  }

  try {
    if (config.deleteById) {
      await config.deleteById(req.params.id);
    } else {
      await config.delegate.delete({ where: { id: req.params.id } });
    }
    res.json({ success: true });
  } catch (error) {
    mapDbmsWriteError(error);
  }
});

export default router;
