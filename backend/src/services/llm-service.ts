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

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LlmCallOptions = {
  pingMode?: boolean;
  messages?: ChatMessage[];
};

type LlmCallResult = {
  content: string;
  finishReason: string;
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

function hasClosingHtmlTag(html: string): boolean {
  return html.trimEnd().toLowerCase().endsWith("</html>");
}

function sanitizeTemperature(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 0.3;
  }
  return Math.max(0, Math.min(2, parsed));
}

function sanitizeMaxTokens(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 12000;
  }
  const rounded = Math.floor(parsed);
  return Math.max(512, Math.min(16000, rounded));
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

    const initialMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(aggregatedData) }
    ];

    const reportConfig: LlmConfig = {
      ...mergedConfig,
      maxTokens: Math.max(12000, sanitizeMaxTokens(mergedConfig.maxTokens))
    };

    const attemptsLimit = 4;
    const chunks: string[] = [];
    const messages = [...initialMessages];

    for (let attempt = 1; attempt <= attemptsLimit; attempt += 1) {
      const result = await this.callLlmWithMetadata(reportConfig, undefined, undefined, {
        messages
      });

      chunks.push(result.content);
      const combined = chunks.join("").trim();
      const complete = hasClosingHtmlTag(combined);

      console.log("[LlmService] Report generation chunk", {
        attempt,
        finishReason: result.finishReason,
        chunkLength: result.content.length,
        combinedLength: combined.length,
        complete
      });

      if (complete) {
        return combined;
      }

      if (result.finishReason !== "length") {
        throw new Error(`LLM returned incomplete report (finish_reason: ${result.finishReason})`);
      }

      messages.push(
        { role: "assistant", content: result.content },
        {
          role: "user",
          content: "Continue exactly from where you stopped. Do not repeat previous content. Return only the remaining HTML so the final full output ends with </html>."
        }
      );
    }

    throw new Error("LLM report generation exceeded continuation limit before closing </html> tag");
  }

  private async callLlm(
    currentConfig: LlmConfig,
    request: unknown,
    modelOverride?: string,
    options?: LlmCallOptions
  ): Promise<string> {
    const result = await this.callLlmWithMetadata(currentConfig, request, modelOverride, options);
    return result.content;
  }

  private async callLlmWithMetadata(
    currentConfig: LlmConfig,
    request: unknown,
    modelOverride?: string,
    options?: LlmCallOptions
  ): Promise<LlmCallResult> {
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

    const messages: ChatMessage[] = options?.messages
      ? options.messages
      : options?.pingMode
        ? [{ role: "user", content: "Reply with exactly: OK" }]
        : [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: JSON.stringify(request) }
          ];

    const effectiveTemperature = options?.pingMode ? 0 : sanitizeTemperature(currentConfig.temperature);
    const effectiveMaxTokens = options?.pingMode ? 512 : sanitizeMaxTokens(currentConfig.maxTokens);

    const payload = {
      model,
      messages,
      temperature: effectiveTemperature,
      max_tokens: effectiveMaxTokens
    };

    console.log("[LlmService] Sending request", {
      endpoint,
      provider: currentConfig.provider,
      model,
      pingMode: Boolean(options?.pingMode),
      configuredTemperature: currentConfig.temperature,
      configuredMaxTokens: currentConfig.maxTokens,
      effectiveTemperature: payload.temperature,
      effectiveMaxTokens: payload.max_tokens,
      messageCount: messages.length
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    console.log("[LlmService] Response received", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
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
    const finishReason = typeof firstChoice?.finish_reason === "string" ? firstChoice.finish_reason : "unknown";
    const content = extractTextFromMessageContent(firstChoice?.message?.content);
    if (content) {
      console.log("[LlmService] Parsed message content", {
        finishReason,
        length: content.length,
        endsWithClosingHtmlTag: hasClosingHtmlTag(content)
      });
      return { content, finishReason };
    }

    if (typeof firstChoice?.text === "string" && firstChoice.text.trim()) {
      const text = firstChoice.text.trim();
      console.log("[LlmService] Parsed text content", {
        finishReason,
        length: text.length,
        endsWithClosingHtmlTag: hasClosingHtmlTag(text)
      });
      return { content: text, finishReason };
    }

    const refusal = firstChoice?.message?.refusal;
    if (typeof refusal === "string" && refusal.trim()) {
      throw new Error(`LLM refused request: ${refusal.trim()}`);
    }

    throw new Error(`LLM returned empty content (finish_reason: ${finishReason})`);
  }
}
