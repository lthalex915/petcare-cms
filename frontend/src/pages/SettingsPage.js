import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const defaultConfig = {
    id: "default",
    provider: "OPENROUTER",
    apiBaseUrl: "https://openrouter.ai/api/v1",
    apiKey: "",
    defaultModel: "deepseek/deepseek-v4-flash",
    temperature: 0.3,
    maxTokens: 4000,
    isActive: true
};

function unwrapObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    if (value.data && typeof value.data === "object" && !Array.isArray(value.data)) {
        return value.data;
    }
    if (value.item && typeof value.item === "object" && !Array.isArray(value.item)) {
        return value.item;
    }
    return value;
}

function normalizeConfig(value) {
    const raw = unwrapObject(value);
    const temperature = Number(raw.temperature);
    const maxTokens = Number(raw.maxTokens);
    return {
        ...defaultConfig,
        ...raw,
        provider: typeof raw.provider === "string" ? raw.provider : defaultConfig.provider,
        apiBaseUrl: typeof raw.apiBaseUrl === "string" ? raw.apiBaseUrl : defaultConfig.apiBaseUrl,
        apiKey: typeof raw.apiKey === "string" ? raw.apiKey : defaultConfig.apiKey,
        defaultModel: typeof raw.defaultModel === "string" ? raw.defaultModel : defaultConfig.defaultModel,
        temperature: Number.isFinite(temperature) ? temperature : defaultConfig.temperature,
        maxTokens: Number.isFinite(maxTokens) ? maxTokens : defaultConfig.maxTokens,
        isActive: typeof raw.isActive === "boolean" ? raw.isActive : defaultConfig.isActive
    };
}

export default function SettingsPage() {
    const [config, setConfig] = useState(defaultConfig);
    const [showKey, setShowKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState("");

    useEffect(() => {
        api.get("/settings/llm")
            .then((res) => {
                if (res.data) {
                    setConfig(normalizeConfig(res.data));
                }
            })
            .catch(() => {
                setConfig(defaultConfig);
            });
    }, []);

    const safeTemperature = useMemo(() => {
        const value = Number(config.temperature);
        if (!Number.isFinite(value)) {
            return defaultConfig.temperature;
        }
        return Math.max(0, Math.min(1, value));
    }, [config.temperature]);

    async function save() {
        setSaving(true);
        setResult("");

        try {
            const payload = {
                ...config,
                temperature: safeTemperature,
                apiKey: config.apiKey.includes("*") ? "" : config.apiKey
            };
            const response = await api.put("/settings/llm", payload);
            setConfig(normalizeConfig(response.data));
            setResult("Configuration saved");
        }
        catch {
            setResult("Failed to save configuration");
        }
        finally {
            setSaving(false);
        }
    }

    async function testConnection() {
        setTesting(true);
        setResult("");

        try {
            const response = await api.post("/settings/llm/test", {
                provider: config.provider,
                apiBaseUrl: config.apiBaseUrl,
                apiKey: config.apiKey,
                model: config.defaultModel
            });
            setResult(response.data.success ? `Connection success: ${response.data.response}` : "Connection failed");
        }
        catch {
            setResult("Connection test failed");
        }
        finally {
            setTesting(false);
        }
    }

    return (_jsxs("div", { className: "page-card", children: [_jsx("h1", { style: { marginTop: 0, fontSize: 20 }, children: "LLM API Configuration" }), _jsxs("div", { className: "form-grid", style: { marginBottom: 12 }, children: [_jsxs("select", { value: config.provider, onChange: (e) => setConfig((prev) => ({ ...prev, provider: e.target.value })), children: [_jsx("option", { value: "OPENROUTER", children: "OpenRouter" }), _jsx("option", { value: "OPENAI_COMPAT", children: "OpenAI Compatible" })] }), _jsx("input", { value: config.apiBaseUrl, onChange: (e) => setConfig((prev) => ({ ...prev, apiBaseUrl: e.target.value })), placeholder: "API Base URL" }), _jsxs("div", { style: { gridColumn: "1 / -1", display: "flex", gap: 8 }, children: [_jsx("input", { style: { flex: 1 }, type: showKey ? "text" : "password", value: config.apiKey, onChange: (e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value })), placeholder: "API Key" }), _jsx("button", { type: "button", onClick: () => setShowKey((v) => !v), style: { border: "1px solid #000", background: "#fff", padding: "8px 12px" }, children: showKey ? "Hide" : "Show" })] }), _jsx("input", { value: config.defaultModel, onChange: (e) => setConfig((prev) => ({ ...prev, defaultModel: e.target.value })), placeholder: "Default model" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("label", { style: { minWidth: 80 }, children: "Temperature" }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.1, value: safeTemperature, onChange: (e) => setConfig((prev) => ({ ...prev, temperature: Number(e.target.value) })) }), _jsx("span", { children: safeTemperature.toFixed(1) })] }), _jsx("input", { value: String(config.maxTokens), onChange: (e) => setConfig((prev) => ({ ...prev, maxTokens: Number(e.target.value) || 0 })), placeholder: "Max tokens", type: "number" })] }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { type: "button", onClick: testConnection, disabled: testing, style: { border: "1px solid #000", background: "#fff", color: "#000", padding: "10px 14px" }, children: testing ? "Testing..." : "Test Connection" }), _jsx("button", { type: "button", onClick: save, disabled: saving, style: { border: "1px solid #000", background: "#000", color: "#fff", padding: "10px 14px" }, children: saving ? "Saving..." : "Save" })] }), result && _jsx("div", { style: { marginTop: 12, fontWeight: 600 }, children: result })] }));
}
