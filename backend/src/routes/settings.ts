import { Router } from "express";
import { FoodType, ProviderType } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { LlmService } from "../services/llm-service.js";
import { getPrismaFeatures, prisma } from "../prisma.js";

const router = Router();
const llmService = new LlmService();
const autoFeederSettingDelegate = (prisma as any).autoFeederSetting as {
  findUnique: (args: { where: { id: string }; select: Record<string, unknown> }) => Promise<any>;
  upsert: (args: {
    where: { id: string };
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }) => Promise<any>;
};

function hasAutoFeederDelegate(): boolean {
  return Boolean(
    autoFeederSettingDelegate
    && typeof autoFeederSettingDelegate.findUnique === "function"
    && typeof autoFeederSettingDelegate.upsert === "function"
  );
}

router.use(authenticate);

function maskApiKey(apiKey: string): string {
  if (!apiKey) {
    return "";
  }
  if (apiKey.length <= 8) {
    return "*".repeat(apiKey.length);
  }
  return `${apiKey.slice(0, 4)}${"*".repeat(Math.max(4, apiKey.length - 8))}${apiKey.slice(-4)}`;
}

router.get("/llm", async (_req, res) => {
  const cfg = await llmService.getConfig();
  if (!cfg) {
    return res.json(null);
  }

  res.json({
    ...cfg,
    apiKey: maskApiKey(cfg.apiKey)
  });
});

router.put("/llm", async (req, res) => {
  const body = req.body as {
    provider: ProviderType;
    apiBaseUrl: string;
    apiKey: string;
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };

  if (!body.provider || !body.apiBaseUrl || !body.defaultModel) {
    throw new HttpError(400, "Missing required fields");
  }

  const saved = await llmService.saveConfig({
    provider: body.provider,
    apiBaseUrl: body.apiBaseUrl,
    apiKey: body.apiKey,
    defaultModel: body.defaultModel,
    temperature: Number(body.temperature ?? 0.3),
    maxTokens: Number(body.maxTokens ?? 12000),
    updatedById: req.user!.userId
  });

  res.json({ ...saved, apiKey: maskApiKey(saved.apiKey) });
});

router.post("/llm/test", async (req, res) => {
  const body = req.body as {
    provider: ProviderType;
    apiBaseUrl: string;
    apiKey: string;
    model: string;
    maxTokens?: number;
  };

  if (!body.provider || !body.apiBaseUrl || !body.model) {
    throw new HttpError(400, "provider, apiBaseUrl and model are required");
  }

  try {
    const result = await llmService.testConnection({
      provider: body.provider,
      apiBaseUrl: body.apiBaseUrl,
      apiKey: body.apiKey,
      defaultModel: body.model,
      temperature: 0.3,
      maxTokens: Number(body.maxTokens ?? 512),
      updatedById: req.user!.userId
    });

    res.json(result);
  } catch (error) {
    res.json({
      success: false,
      response: error instanceof Error ? error.message : "Connection test failed"
    });
  }
});

router.get("/auto-feeder", async (_req, res) => {
  const features = await getPrismaFeatures();
  if (!features.autoFeederTable || !hasAutoFeederDelegate()) {
    return res.json({
      id: "default",
      enabled: false,
      foodType: FoodType.DRY,
      foodBrand: "",
      flavor: "",
      amountGrams: null
    });
  }

  const setting = await autoFeederSettingDelegate.findUnique({
    where: { id: "default" },
    select: {
      id: true,
      enabled: true,
      foodType: true,
      foodBrand: true,
      amountGrams: true,
      ...(features.autoFeederFlavor ? { flavor: true } : {})
    }
  });
  if (!setting) {
    return res.json({
      id: "default",
      enabled: false,
      foodType: FoodType.DRY,
      foodBrand: "",
      flavor: "",
      amountGrams: null
    });
  }

  if (!features.autoFeederFlavor) {
    return res.json({ ...setting, flavor: "" });
  }

  res.json(setting);
});

router.put("/auto-feeder", async (req, res) => {
  const features = await getPrismaFeatures();
  if (!features.autoFeederTable || !hasAutoFeederDelegate()) {
    const body = req.body as {
      enabled?: boolean;
      foodType?: FoodType;
      foodBrand?: string | null;
      flavor?: string | null;
      amountGrams?: number | string | null;
    };

    const fallbackFoodType = body.foodType && Object.values(FoodType).includes(body.foodType) ? body.foodType : FoodType.DRY;
    const fallbackAmount = body.amountGrams == null || body.amountGrams === "" ? null : Number(body.amountGrams);

    return res.json({
      id: "default",
      enabled: Boolean(body.enabled),
      foodType: fallbackFoodType,
      foodBrand: typeof body.foodBrand === "string" ? body.foodBrand.trim() : "",
      flavor: typeof body.flavor === "string" ? body.flavor.trim() : "",
      amountGrams: Number.isFinite(fallbackAmount) ? fallbackAmount : null,
      warning: "Auto feeder settings are not persisted until database migrations and Prisma client updates are applied"
    });
  }

  const body = req.body as {
    enabled?: boolean;
    foodType?: FoodType;
    foodBrand?: string | null;
    flavor?: string | null;
    amountGrams?: number | string | null;
  };

  const foodType = body.foodType;
  if (!foodType || !Object.values(FoodType).includes(foodType)) {
    throw new HttpError(400, "Invalid foodType");
  }

  const foodBrand = typeof body.foodBrand === "string" ? body.foodBrand.trim() : "";
  const flavor = typeof body.flavor === "string" ? body.flavor.trim() : "";
  const parsedAmount = body.amountGrams == null || body.amountGrams === ""
    ? null
    : Number(body.amountGrams);

  if (parsedAmount != null && (!Number.isFinite(parsedAmount) || parsedAmount < 0)) {
    throw new HttpError(400, "amountGrams must be a non-negative number");
  }

  const saved = await autoFeederSettingDelegate.upsert({
    where: { id: "default" },
    update: {
      enabled: Boolean(body.enabled),
      foodType,
      foodBrand: foodBrand || null,
      ...(features.autoFeederFlavor ? { flavor: flavor || null } : {}),
      amountGrams: parsedAmount,
      updatedById: req.user!.userId
    },
    create: {
      id: "default",
      enabled: Boolean(body.enabled),
      foodType,
      foodBrand: foodBrand || null,
      ...(features.autoFeederFlavor ? { flavor: flavor || null } : {}),
      amountGrams: parsedAmount,
      updatedById: req.user!.userId
    }
  });

  if (!features.autoFeederFlavor) {
    return res.json({ ...saved, flavor: "" });
  }

  res.json(saved);
});

export default router;
