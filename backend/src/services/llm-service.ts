import { ProviderType, type LlmConfig } from "@prisma/client";
import { config } from "../config.js";
import { prisma } from "../prisma.js";
import { SYSTEM_PROMPT } from "./report-system-prompt.js";

type ConfigInput = {
  provider: ProviderType;
  apiBaseUrl: string;
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  updatedById?: string;
};

function isMaskedApiKey(value: string | null | undefined): boolean {
  return typeof value === "string" && value.includes("*");
}

function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "").replace(/\/chat\/completions$/i, "");
}

function extractTextFromMessageContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  const parts: string[] = [];
  for (const item of content) {
    if (typeof item === "string") {
      parts.push(item);
      continue;
    }

    if (typeof item === "object" && item !== null) {
      const text = (item as { text?: unknown }).text;
      if (typeof text === "string") {
        parts.push(text);
      }
    }
  }

  return parts.join("\n").trim();
}

export class LlmService {
  async getConfig(): Promise<LlmConfig | null> {
    return prisma.llmConfig.findUnique({ where: { id: "default" } });
  }

  async saveConfig(data: ConfigInput): Promise<LlmConfig> {
    const current = await this.getConfig();
    const apiKey = !data.apiKey || isMaskedApiKey(data.apiKey) ? current?.apiKey ?? "" : data.apiKey;

    return prisma.llmConfig.upsert({
      where: { id: "default" },
      update: {
        provider: data.provider,
        apiBaseUrl: data.apiBaseUrl,
        apiKey,
        defaultModel: data.defaultModel,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        updatedById: data.updatedById
      },
      create: {
        id: "default",
        provider: data.provider,
        apiBaseUrl: data.apiBaseUrl,
        apiKey,
        defaultModel: data.defaultModel,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        updatedById: data.updatedById,
        isActive: true
      }
    });
  }

  async testConnection(configInput: ConfigInput): Promise<{ success: boolean; response: string }> {
    const current = await this.getConfig();
    const effectiveApiKey = !configInput.apiKey || isMaskedApiKey(configInput.apiKey) ? current?.apiKey ?? "" : configInput.apiKey;

    if (!effectiveApiKey) {
      throw new Error("LLM API key is not configured");
    }

    const ping = await this.callLlm({
      ...(current as LlmConfig | null),
      ...configInput,
      id: current?.id ?? "default",
      apiKey: effectiveApiKey,
      isActive: current?.isActive ?? true,
      updatedAt: current?.updatedAt ?? new Date(),
      updatedById: configInput.updatedById ?? current?.updatedById ?? null
    } as LlmConfig, { ping: true }, configInput.defaultModel, { pingMode: true });
    return { success: true, response: ping.slice(0, 500) };
  }

  async generateReport(aggregatedData: unknown, customConfig?: Partial<ConfigInput>): Promise<string> {
    const dbConfig = await this.getConfig();
    if (!dbConfig && !customConfig) {
      throw new Error("No active LLM configuration");
    }

    const mergedConfig: LlmConfig = {
      ...(dbConfig as LlmConfig),
      ...(customConfig ?? {}),
      id: "default",
      isActive: true,
      updatedAt: new Date(),
      updatedById: customConfig?.updatedById ?? dbConfig?.updatedById ?? null
    };

    if (!mergedConfig.apiKey) {
      throw new Error("LLM API key is not configured");
    }

    return this.callLlm(mergedConfig, aggregatedData);
  }

  private async callLlm(
    currentConfig: LlmConfig,
    request: unknown,
    modelOverride?: string,
    options?: { pingMode?: boolean }
  ): Promise<string> {
    const endpoint = `${normalizeApiBaseUrl(currentConfig.apiBaseUrl)}/chat/completions`;
    const model = (modelOverride ?? currentConfig.defaultModel).trim().replace(/^~/, "");
    if (!model) {
      throw new Error("LLM model is not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentConfig.apiKey.trim()}`
    };

    if (currentConfig.provider === ProviderType.OPENROUTER) {
      headers["HTTP-Referer"] = config.appUrl;
      headers["X-OpenRouter-Title"] = config.appTitle;
    }

    const messages = options?.pingMode
      ? [{ role: "user", content: "Reply with exactly: OK" }]
      : [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(request) }
        ];

    const payload = {
      model,
      messages,
      temperature: options?.pingMode ? 0 : currentConfig.temperature,
      max_tokens: options?.pingMode ? 512 : currentConfig.maxTokens
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      try {
        const parsed = JSON.parse(body) as { error?: { message?: string } };
        const message = parsed.error?.message;
        throw new Error(`LLM API error ${response.status}: ${message ?? body}`);
      } catch {
        throw new Error(`LLM API error ${response.status}: ${body}`);
      }
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: { content?: unknown; refusal?: unknown };
        text?: unknown;
        finish_reason?: unknown;
      }>;
    };

    const firstChoice = data.choices?.[0];
    const content = extractTextFromMessageContent(firstChoice?.message?.content);
    if (content) {
      return content;
    }

    if (typeof firstChoice?.text === "string" && firstChoice.text.trim()) {
      return firstChoice.text.trim();
    }

    const refusal = firstChoice?.message?.refusal;
    if (typeof refusal === "string" && refusal.trim()) {
      throw new Error(`LLM refused request: ${refusal.trim()}`);
    }

    const finishReason = typeof firstChoice?.finish_reason === "string" ? firstChoice.finish_reason : "unknown";
    throw new Error(`LLM returned empty content (finish_reason: ${finishReason})`);
  }
}
