import { Router } from "express";
import { ProviderType } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { LlmService } from "../services/llm-service.js";

const router = Router();
const llmService = new LlmService();
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
    maxTokens: Number(body.maxTokens ?? 4000),
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

export default router;
