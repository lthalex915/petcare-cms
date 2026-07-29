import { useEffect, useState } from "react";
import api from "../services/api";
import type { LlmConfig, ProviderType } from "../types";

const defaultConfig: LlmConfig = {
  id: "default",
  provider: "OPENROUTER",
  apiBaseUrl: "https://openrouter.ai/api/v1",
  apiKey: "",
  defaultModel: "deepseek/deepseek-v4-flash",
  temperature: 0.3,
  maxTokens: 4000,
  isActive: true
};

function normalizeConfig(value: Partial<LlmConfig> | null | undefined): LlmConfig {
  if (!value) {
    return defaultConfig;
  }

  const temperature = typeof value.temperature === "number" ? value.temperature : Number(value.temperature);
  const maxTokens = typeof value.maxTokens === "number" ? value.maxTokens : Number(value.maxTokens);

  return {
    ...defaultConfig,
    ...value,
    provider: typeof value.provider === "string" ? value.provider : defaultConfig.provider,
    apiBaseUrl: typeof value.apiBaseUrl === "string" ? value.apiBaseUrl : defaultConfig.apiBaseUrl,
    apiKey: typeof value.apiKey === "string" ? value.apiKey : defaultConfig.apiKey,
    defaultModel: typeof value.defaultModel === "string" ? value.defaultModel : defaultConfig.defaultModel,
    temperature: Number.isFinite(temperature) ? temperature : defaultConfig.temperature,
    maxTokens: Number.isFinite(maxTokens) ? maxTokens : defaultConfig.maxTokens,
    isActive: typeof value.isActive === "boolean" ? value.isActive : defaultConfig.isActive
  };
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown; status?: number } }).response;
    const data = response?.data;

    if (typeof data === "object" && data !== null) {
      if ("response" in data && typeof (data as { response?: unknown }).response === "string") {
        return (data as { response: string }).response;
      }
      if ("message" in data && typeof (data as { message?: unknown }).message === "string") {
        return (data as { message: string }).message;
      }
    }

    if (typeof response?.status === "number") {
      return `HTTP ${response.status}`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown error";
}

export default function SettingsPage() {
  const [config, setConfig] = useState<LlmConfig>(defaultConfig);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    api.get<LlmConfig | null>("/settings/llm").then((res) => {
      if (res.data) {
        setConfig(normalizeConfig(res.data));
      }
    }).catch(() => {
      setConfig(defaultConfig);
    });
  }, []);

  async function save() {
    setSaving(true);
    setResult("");
    try {
      const payload = {
        ...config,
        apiKey: config.apiKey.includes("*") ? "" : config.apiKey
      };
      const response = await api.put<LlmConfig>("/settings/llm", payload);
      setConfig(normalizeConfig(response.data));
      setResult("Configuration saved");
    } catch {
      setResult("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setResult("");
    try {
      const testModel = config.defaultModel;
      const response = await api.post<{ success: boolean; response: string }>("/settings/llm/test", {
        provider: config.provider,
        apiBaseUrl: config.apiBaseUrl,
        apiKey: config.apiKey.includes("*") ? "" : config.apiKey,
        model: testModel,
        maxTokens: Math.max(512, config.maxTokens || 0)
      });
      setResult(response.data.success ? `Connection success: ${response.data.response}` : `Connection failed: ${response.data.response || "Unknown error"}`);
    } catch (error) {
      setResult(`Connection test failed: ${extractErrorMessage(error)}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>LLM API Configuration</h1>

      <div className="form-grid" style={{ marginBottom: 12 }}>
        <select
          value={config.provider}
          onChange={(e) => setConfig((prev) => ({ ...prev, provider: e.target.value as ProviderType }))}
        >
          <option value="OPENROUTER">OpenRouter</option>
          <option value="OPENAI_COMPAT">OpenAI Compatible</option>
        </select>
        <input
          value={config.apiBaseUrl}
          onChange={(e) => setConfig((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
          placeholder="API Base URL"
        />

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1 }}
            type={showKey ? "text" : "password"}
            value={config.apiKey}
            onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
            placeholder="API Key"
          />
          <button type="button" onClick={() => setShowKey((v) => !v)} style={{ border: "1px solid #000", background: "#fff", padding: "8px 12px" }}>
            {showKey ? "Hide" : "Show"}
          </button>
        </div>

        <input
          value={config.defaultModel}
          onChange={(e) => setConfig((prev) => ({ ...prev, defaultModel: e.target.value }))}
          placeholder="Default model"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ minWidth: 80 }}>Temperature</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={config.temperature}
            onChange={(e) => setConfig((prev) => ({ ...prev, temperature: Number(e.target.value) }))}
          />
          <span>{config.temperature.toFixed(1)}</span>
        </div>

        <input
          value={String(config.maxTokens)}
          onChange={(e) => setConfig((prev) => ({ ...prev, maxTokens: Number(e.target.value) || 0 }))}
          placeholder="Max tokens"
          type="number"
        />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={testConnection} disabled={testing} style={{ border: "1px solid #000", background: "#fff", padding: "10px 16px" }}>
          {testing ? "Testing..." : "Test Connection"}
        </button>
        <button type="button" onClick={save} disabled={saving} style={{ border: "none", background: "#000", color: "#fff", padding: "10px 16px" }}>
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {result && <div style={{ marginTop: 12, fontWeight: 700 }}>{result}</div>}
    </div>
  );
}
