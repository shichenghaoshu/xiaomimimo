import { useState } from "react";
import {
  Settings,
  Cpu,
  Key,
  Shield,
  Eye,
  EyeOff,
  Wifi,
  ExternalLink,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Globe,
} from "lucide-react";
import type { AppSettings } from "@/lib/types";
import { useSettingsStore } from "@/stores/settingsStore";
import { saveApiKey, testConnection } from "@/lib/tauri";

const PROVIDER_OPTIONS = [
  { value: "xiaomi", label: "Xiaomi (MiMo)" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "openai", label: "OpenAI" },
];

const SANDBOX_OPTIONS = [
  { value: "strict", label: "Strict (iframe sandbox)" },
  { value: "permissive", label: "Permissive (same origin)" },
  { value: "none", label: "None (no sandbox)" },
];

// ── Toggle Switch ──

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
        disabled
          ? "bg-[#2a2f3a] opacity-40 cursor-not-allowed"
          : checked
            ? "bg-[#ff6900] shadow-sm shadow-[#ff6900]/30"
            : "bg-[#2a2f3a]"
      } focus-visible:outline-2 focus-visible:outline-[#ff6900]`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Editable field ──

function EditableField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#2a2f3a]/50 last:border-b-0 hover:bg-[#0f1115]/80 transition-colors">
      <span className="text-xs text-[#9ca3af] flex-shrink-0 mr-3">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs text-[#e6e6e6] bg-transparent border border-transparent rounded-md px-2 py-0.5 outline-none text-right max-w-[55%] truncate font-mono focus:border-[#ff6900]/30 focus:bg-[#171a21] transition-all"
      />
    </div>
  );
}

// ── Main Component ──

export default function SettingsPage() {
  const storeSettings = useSettingsStore((s) => s.settings);
  const storeApiKey = useSettingsStore((s) => s.apiKey);
  const storeApiKeySource = useSettingsStore((s) => s.apiKeySource);
  const storeSave = useSettingsStore((s) => s.save);
  const configureKey = useSettingsStore((s) => s.configureKey);
  const clearKey = useSettingsStore((s) => s.clearKey);

  const [settings, setSettings] = useState<AppSettings>(
    storeSettings ?? {
      provider: "xiaomi",
      baseUrl: "https://api.xiaomimimo.com/v1",
      defaultModel: "mimo-v2.5-pro",
      codingModel: "mimo-v2.5-pro",
      visionModel: "mimo-v2-omni",
      ttsModel: "mimo-v2.5-tts",
      requireApprovalForFiles: true,
      requireApprovalForShell: true,
      requireApprovalForGit: true,
      requireApprovalForMcp: true,
      allowYolo: false,
      artifactSandbox: "strict",
      ttsEnabled: true,
      ttsVoice: "professional_cn",
      ttsSpeed: 1.0,
    }
  );

  const [apiKeyInput, setApiKeyInput] = useState(storeApiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync local state when store loads
  const [synced, setSynced] = useState(false);
  if (storeSettings && !synced) {
    setSettings(storeSettings);
    setSynced(true);
  }

  const update = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSaveStatus(null);
  };

  const handleSaveSettings = async () => {
    try {
      await storeSave(settings);
      setSaveStatus("Settings saved.");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus(
        e instanceof Error ? e.message : "Failed to save settings"
      );
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setSavingKey(true);
    setSaveStatus(null);
    try {
      await configureKey(settings.provider, apiKeyInput.trim(), settings.baseUrl);
      setSaveStatus("API key saved successfully.");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus(
        e instanceof Error ? e.message : "Failed to save API key"
      );
    } finally {
      setSavingKey(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(settings.provider, apiKeyInput.trim(), settings.baseUrl);
      setTestResult(result);
    } catch (e) {
      setTestResult({
        ok: false,
        message: e instanceof Error ? e.message : "Connection test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  const maskedKey = storeApiKey
    ? storeApiKey.slice(0, 3) +
      "*".repeat(Math.max(0, storeApiKey.length - 7)) +
      storeApiKey.slice(-4)
    : null;

  return (
    <div className="h-full flex flex-col bg-[#171a21] overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2f3a] flex-shrink-0 sticky top-0 bg-[#171a21] z-10">
        <Settings size={16} className="text-[#ff6900]" />
        <span className="text-sm font-semibold text-[#e6e6e6] tracking-tight">Settings</span>

        {/* Save status */}
        {saveStatus && (
          <span className="ml-auto text-[11px] text-[#9ca3af]/70 animate-fade-in">
            {saveStatus}
          </span>
        )}
        <button
          onClick={handleSaveSettings}
          className="ml-auto flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-[#ff6900] text-xs font-semibold text-white hover:bg-[#e55d00] transition-all duration-200 active:scale-[0.98] shadow-sm shadow-[#ff6900]/20"
        >
          <Save size={12} />
          Save Settings
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* ── Model Settings ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <Cpu size={14} className="text-[#9ca3af]" />
            <span className="text-xs font-semibold text-[#e6e6e6] tracking-tight">
              Model Settings
            </span>
          </div>

          <div className="border border-[#2a2f3a] rounded-xl bg-[#0f1115] overflow-hidden hover:border-[#3a4050] transition-colors duration-200">
            <div className="px-4 py-0">
              {/* Provider - editable select */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#2a2f3a]/50">
                <span className="text-xs text-[#9ca3af]">Provider</span>
                <select
                  value={settings.provider}
                  onChange={(e) => update({ provider: e.target.value })}
                  className="text-xs bg-[#171a21] border border-[#2a2f3a] text-[#e6e6e6] rounded-lg px-2.5 py-1 outline-none focus:border-[#ff6900]/50 focus:ring-1 focus:ring-[#ff6900]/15 transition-all cursor-pointer"
                >
                  {PROVIDER_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Base URL - editable */}
              <EditableField
                label="Base URL"
                value={settings.baseUrl}
                onChange={(v) => update({ baseUrl: v })}
                placeholder="https://api.example.com/v1"
              />

              {/* Default Model - editable */}
              <EditableField
                label="Default Model"
                value={settings.defaultModel}
                onChange={(v) => update({ defaultModel: v })}
              />

              {/* Coding Model - editable */}
              <EditableField
                label="Coding Model"
                value={settings.codingModel}
                onChange={(v) => update({ codingModel: v })}
              />

              {/* Vision Model - editable */}
              <EditableField
                label="Vision Model"
                value={settings.visionModel}
                onChange={(v) => update({ visionModel: v })}
              />

              {/* TTS Model - editable */}
              <EditableField
                label="TTS Model"
                value={settings.ttsModel}
                onChange={(v) => update({ ttsModel: v })}
              />
            </div>
          </div>
        </section>

        {/* ── API Key ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <Key size={14} className="text-[#9ca3af]" />
            <span className="text-xs font-semibold text-[#e6e6e6] tracking-tight">
              API Key
            </span>
          </div>

          <div className="border border-[#2a2f3a] rounded-xl bg-[#0f1115] p-4 space-y-3 hover:border-[#3a4050] transition-colors duration-200">
            {/* API Key input */}
            <div>
              <label className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-1.5 block font-medium">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="sk-... or tp-..."
                  className="w-full bg-[#171a21] border border-[#2a2f3a] rounded-xl px-3.5 py-2 pr-10 text-xs text-[#e6e6e6] placeholder:text-[#4a505a] outline-none focus:border-[#ff6900]/50 focus:ring-1 focus:ring-[#ff6900]/15 transition-all duration-200 font-mono"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#e6e6e6] transition-colors"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Current stored key (if any) */}
            {storeApiKey && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#9ca3af]">Stored key:</span>
                <span className="text-[#e6e6e6] font-mono tracking-wider">
                  {maskedKey}
                </span>
              </div>
            )}

            {/* Env var status */}
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-[#9ca3af]">Environment variable:</span>
              <span className="text-[#e6e6e6] font-mono">
                XIAOMIMIMO_API_KEY
              </span>
              {storeApiKeySource === "env" ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[#22c55e] font-medium">set</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af]" />
                  <span className="text-[#9ca3af]">not set</span>
                </>
              )}
            </div>

            {/* Save API key button */}
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim() || savingKey}
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl border border-[#2a2f3a] text-xs font-medium text-[#e6e6e6] hover:bg-[#2a2f3a] hover:border-[#3a4050] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {savingKey ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} className="text-[#ff6900]" />
              )}
              Save API Key
            </button>

            {/* Test connection button */}
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-2 py-2 px-3.5 rounded-xl border border-[#2a2f3a] text-xs font-medium text-[#e6e6e6] hover:bg-[#2a2f3a] hover:border-[#3a4050] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {testing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : testResult?.ok ? (
                <Check size={13} className="text-[#22c55e]" />
              ) : testResult && !testResult.ok ? (
                <AlertCircle size={13} className="text-red-400" />
              ) : (
                <Wifi size={13} className="text-[#9ca3af]" />
              )}
              Test Connection
              <Globe size={10} className="ml-auto text-[#9ca3af]" />
            </button>

            {/* Test result feedback */}
            {testResult && (
              <div
                className={`flex items-start gap-2 p-2.5 rounded-xl text-[10px] animate-fade-in ${
                  testResult.ok
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {testResult.ok ? (
                  <Check size={12} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                )}
                {testResult.message}
              </div>
            )}
          </div>
        </section>

        {/* ── Safety ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <Shield size={14} className="text-[#9ca3af]" />
            <span className="text-xs font-semibold text-[#e6e6e6] tracking-tight">Safety</span>
          </div>

          <div className="border border-[#2a2f3a] rounded-xl bg-[#0f1115] overflow-hidden hover:border-[#3a4050] transition-colors duration-200">
            {/* File approval */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2f3a]/50 hover:bg-[#0f1115]/80 transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <span className="text-xs font-medium text-[#e6e6e6]">
                  Require approval for file operations
                </span>
                <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                  Prompt before reading, writing, or deleting files
                </p>
              </div>
              <Toggle
                checked={settings.requireApprovalForFiles}
                onChange={(v) => update({ requireApprovalForFiles: v })}
              />
            </div>

            {/* Shell approval */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2f3a]/50 hover:bg-[#0f1115]/80 transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <span className="text-xs font-medium text-[#e6e6e6]">
                  Require approval for shell commands
                </span>
                <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                  Prompt before executing shell commands
                </p>
              </div>
              <Toggle
                checked={settings.requireApprovalForShell}
                onChange={(v) => update({ requireApprovalForShell: v })}
              />
            </div>

            {/* Git approval */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2f3a]/50 hover:bg-[#0f1115]/80 transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <span className="text-xs font-medium text-[#e6e6e6]">
                  Require approval for git operations
                </span>
                <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                  Prompt before commits, pushes, and branch changes
                </p>
              </div>
              <Toggle
                checked={settings.requireApprovalForGit}
                onChange={(v) => update({ requireApprovalForGit: v })}
              />
            </div>

            {/* MCP approval */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2f3a]/50 hover:bg-[#0f1115]/80 transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <span className="text-xs font-medium text-[#e6e6e6]">
                  Require approval for MCP tools
                </span>
                <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                  Prompt before invoking MCP server tools
                </p>
              </div>
              <Toggle
                checked={settings.requireApprovalForMcp}
                onChange={(v) => update({ requireApprovalForMcp: v })}
              />
            </div>

            {/* YOLO mode */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2f3a]/50 hover:bg-[#0f1115]/80 transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <span className="text-xs font-medium text-[#e6e6e6]">YOLO mode</span>
                <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                  Skip all approval prompts (not recommended)
                </p>
              </div>
              <Toggle
                checked={settings.allowYolo}
                onChange={(v) => update({ allowYolo: v })}
                disabled
              />
            </div>

            {/* Artifact sandbox */}
            <div className="flex items-center justify-between px-4 py-3 hover:bg-[#0f1115]/80 transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <span className="text-xs font-medium text-[#e6e6e6]">
                  Artifact sandbox level
                </span>
                <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                  Controls sandboxing for rendered artifact content
                </p>
              </div>
              <select
                value={settings.artifactSandbox}
                onChange={(e) => update({ artifactSandbox: e.target.value })}
                className="text-xs bg-[#171a21] border border-[#2a2f3a] text-[#e6e6e6] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#ff6900]/50 focus:ring-1 focus:ring-[#ff6900]/15 transition-all cursor-pointer"
              >
                {SANDBOX_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
