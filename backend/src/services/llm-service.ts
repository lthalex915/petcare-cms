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

export class LlmService {
  async getConfig(): Promise<LlmConfig | null> {
    return prisma.llmConfig.findUnique({ where: { id: "default" } });
  }

  async saveConfig(data: ConfigInput): Promise<LlmConfig> {
    return prisma.llmConfig.upsert({
      where: { id: "default" },
      update: {
        provider: data.provider,
        apiBaseUrl: data.apiBaseUrl,
        apiKey: data.apiKey,
        defaultModel: data.defaultModel,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        updatedById: data.updatedById
      },
      create: {
        id: "default",
        provider: data.provider,
        apiBaseUrl: data.apiBaseUrl,
        apiKey: data.apiKey,
        defaultModel: data.defaultModel,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        updatedById: data.updatedById,
        isActive: true
      }
    });
  }

  async testConnection(configInput: ConfigInput): Promise<{ success: boolean; response: string }> {
    const ping = await this.callLlm(configInput as LlmConfig, { ping: true }, configInput.defaultModel);
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

  private async callLlm(currentConfig: LlmConfig, request: unknown, modelOverride?: string): Promise<string> {
    const endpoint = `${currentConfig.apiBaseUrl.replace(/\/$/, "")}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentConfig.apiKey}`
    };

    if (currentConfig.provider === ProviderType.OPENROUTER) {
      headers["HTTP-Referer"] = config.appUrl;
      headers["X-Title"] = config.appTitle;
    }

    const payload = {
      model: modelOverride ?? currentConfig.defaultModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(request) }
      ],
      temperature: currentConfig.temperature,
      max_tokens: currentConfig.maxTokens
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM API error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned empty content");
    }

    return content;
  }
}
