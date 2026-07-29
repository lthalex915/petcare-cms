import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import type { AutoFeederSetting, FoodType, LlmConfig, ProviderType } from "../types";
import { readFrequentFoods, saveFrequentFoods } from "../utils/frequentFoods";

const defaultConfig: LlmConfig = {
  id: "default",
  provider: "OPENROUTER",
  apiBaseUrl: "https://openrouter.ai/api/v1",
  apiKey: "",
  defaultModel: "deepseek/deepseek-v4-flash",
  temperature: 0.3,
  maxTokens: 12000,
  isActive: true
};

const defaultAutoFeederSetting: AutoFeederSetting = {
  id: "default",
  enabled: false,
  foodType: "DRY",
  foodBrand: "",
  flavor: "",
  amountGrams: null
};

function normalizeFrequentFoods(value: string[]): string[] {
  return Array.from(new Set(value.map((item) => item.trim()).filter(Boolean)));
}

function normalizeAutoFeederSetting(value: Partial<AutoFeederSetting> | null | undefined): AutoFeederSetting {
  if (!value) {
    return defaultAutoFeederSetting;
  }
  return {
    ...defaultAutoFeederSetting,
    ...value,
    enabled: Boolean(value.enabled),
    foodType: value.foodType === "WET" || value.foodType === "DRY" || value.foodType === "BOTH" ? value.foodType : "DRY",
    foodBrand: typeof value.foodBrand === "string" ? value.foodBrand : "",
    flavor: typeof value.flavor === "string" ? value.flavor : "",
    amountGrams:
      typeof value.amountGrams === "number"
        ? value.amountGrams
        : value.amountGrams == null
          ? null
          : Number(value.amountGrams)
  };
}

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
  const { adminMode, setAdminMode } = useAuth();
  const [adminModeDraft, setAdminModeDraft] = useState(adminMode);
  const [config, setConfig] = useState<LlmConfig>(defaultConfig);
  const [autoFeederSetting, setAutoFeederSetting] = useState<AutoFeederSetting>(defaultAutoFeederSetting);
  const [frequentFoods, setFrequentFoods] = useState<string[]>([]);
  const [newFrequentFood, setNewFrequentFood] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    setAdminModeDraft(adminMode);
  }, [adminMode]);

  useEffect(() => {
    api.get<LlmConfig | null>("/settings/llm").then((res) => {
      if (res.data) {
        setConfig(normalizeConfig(res.data));
      }
    }).catch(() => {
      setConfig(defaultConfig);
    });

    setFrequentFoods(normalizeFrequentFoods(readFrequentFoods()));
    api.get<AutoFeederSetting | null>("/settings/auto-feeder").then((res) => {
      setAutoFeederSetting(normalizeAutoFeederSetting(res.data));
    }).catch(() => {
      setAutoFeederSetting(defaultAutoFeederSetting);
    });
  }, []);

  function addFrequentFood() {
    const value = newFrequentFood.trim();
    if (!value) {
      return;
    }
    setFrequentFoods((prev) => normalizeFrequentFoods([...prev, value]));
    setNewFrequentFood("");
  }

  function removeFrequentFood(food: string) {
    setFrequentFoods((prev) => prev.filter((item) => item !== food));
  }

  async function save() {
    setSaving(true);
    setResult("");
    try {
      const payload = {
        ...config,
        apiKey: config.apiKey.includes("*") ? "" : config.apiKey
      };
      const response = await api.put<LlmConfig>("/settings/llm", payload);
      await api.put<AutoFeederSetting>("/settings/auto-feeder", {
        ...autoFeederSetting,
        amountGrams:
          autoFeederSetting.amountGrams == null || Number.isNaN(Number(autoFeederSetting.amountGrams))
            ? null
            : Number(autoFeederSetting.amountGrams)
      });
      const savedFrequentFoods = saveFrequentFoods(normalizeFrequentFoods(frequentFoods));
      setFrequentFoods(savedFrequentFoods);
      setAdminMode(adminModeDraft);
      setConfig(normalizeConfig(response.data));
      setResult("All settings saved");
    } catch {
      setResult("Failed to save settings");
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

      <div style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd", background: "#fafafa" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Admin Mode</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={adminModeDraft}
            onChange={(e) => {
              const enabled = e.target.checked;
              setAdminModeDraft(enabled);
              setAdminMode(enabled);
            }}
          />
          Enable admin mode for editing/deleting pets, daily logs, and reports
        </label>
      </div>

      <div style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd", background: "#fafafa" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Auto Feeder (自動餵食器)</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={autoFeederSetting.enabled}
            onChange={(e) => setAutoFeederSetting((prev) => ({ ...prev, enabled: e.target.checked }))}
          />
          Food provided by 自動餵食器 is auto-added daily
        </label>

        <div className="form-grid">
          <select
            value={autoFeederSetting.foodType}
            onChange={(e) => setAutoFeederSetting((prev) => ({ ...prev, foodType: e.target.value as FoodType }))}
          >
            <option value="WET">Wet</option>
            <option value="DRY">Dry</option>
            <option value="BOTH">Both</option>
          </select>
          <input
            value={autoFeederSetting.foodBrand ?? ""}
            onChange={(e) => setAutoFeederSetting((prev) => ({ ...prev, foodBrand: e.target.value }))}
            placeholder="Food brand"
          />
          <input
            value={autoFeederSetting.flavor ?? ""}
            onChange={(e) => setAutoFeederSetting((prev) => ({ ...prev, flavor: e.target.value }))}
            placeholder="Flavor (recommended, optional)"
          />
          <input
            value={autoFeederSetting.amountGrams == null ? "" : String(autoFeederSetting.amountGrams)}
            onChange={(e) => setAutoFeederSetting((prev) => ({ ...prev, amountGrams: e.target.value === "" ? null : Number(e.target.value) }))}
            type="number"
            min={0}
            step={1}
            placeholder="Amount (grams)"
          />
        </div>
      </div>

      <div style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd", background: "#fafafa" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Frequent Foods</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            value={newFrequentFood}
            onChange={(e) => setNewFrequentFood(e.target.value)}
            placeholder="Add food or brand"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addFrequentFood();
              }
            }}
          />
          <button type="button" onClick={addFrequentFood} style={{ border: "1px solid #000", background: "#fff", padding: "8px 12px" }}>
            Add
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {frequentFoods.length === 0 ? (
            <span style={{ color: "#666", fontSize: 12 }}>No frequent foods added yet.</span>
          ) : (
            frequentFoods.map((food) => (
              <button
                key={food}
                type="button"
                onClick={() => removeFrequentFood(food)}
                style={{ border: "1px solid #ccc", background: "#fff", padding: "4px 8px", fontSize: 12 }}
                title="Remove"
              >
                {food} x
              </button>
            ))
          )}
        </div>
      </div>

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
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {result && <div style={{ marginTop: 12, fontWeight: 700 }}>{result}</div>}
    </div>
  );
}
