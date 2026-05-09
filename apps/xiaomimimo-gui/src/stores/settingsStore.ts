import { create } from "zustand";
import type { AppSettings } from "@/lib/types";
import { getSettings, updateSettings, saveApiKey as saveApiKeyTauri, deleteApiKey as deleteApiKeyTauri } from "@/lib/tauri";

interface SettingsState {
  settings: AppSettings | null;
  loaded: boolean;
  apiKey: string | null;
  apiKeySource: "env" | "manual" | null;
  isConfigured: boolean;
  load: () => Promise<void>;
  save: (s: AppSettings) => Promise<void>;
  configureKey: (provider: string, key: string, baseUrl: string) => Promise<void>;
  clearKey: () => void;
}

const defaultSettings: AppSettings = {
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
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loaded: false,
  apiKey: null,
  apiKeySource: null,
  isConfigured: false,

  load: async () => {
    try {
      const settings = await getSettings();
      let apiKey: string | null = null;
      let apiKeySource: "env" | "manual" | null = null;

      // 1. Check localStorage (GUI manual entry)
      if (typeof window !== "undefined") {
        const savedKey = localStorage.getItem("xiaomimimo_api_key");
        if (savedKey) {
          apiKey = savedKey;
          apiKeySource = "manual";
        }
      }

      // 2. Check if backend returned a masked key (config.toml has one)
      if (!apiKey && settings.apiKeyPreview && settings.apiKeyPreview !== "********") {
        const localKey = typeof window !== "undefined"
          ? localStorage.getItem("xiaomimimo_api_key_from_config") : null;
        apiKey = localKey; // can't get plaintext from backend, but we know key exists
        apiKeySource = "manual"; // treat config-file key as manually configured
      }

      // 3. API key is considered configured if:
      //    - localStorage has a key, OR
      //    - backend reports a masked key (config.toml exists), OR
      //    - settings connection_status is "connected"
      const isConfigured = apiKey !== null
        || (settings.apiKeyPreview && settings.apiKeyPreview.length > 0)
        || settings.connectionStatus === "connected";

      set({ settings, loaded: true, apiKey, apiKeySource, isConfigured });
    } catch {
      set({ loaded: true });
    }
  },

  save: async (settings) => {
    await updateSettings(settings);
    const { apiKey } = get();
    set({ settings, isConfigured: apiKey !== null });
  },

  configureKey: async (provider: string, key: string, baseUrl: string) => {
    // Always save to localStorage first (works everywhere, no Tauri needed)
    if (typeof window !== "undefined") {
      localStorage.setItem("xiaomimimo_api_key", key);
      localStorage.setItem("xiaomimimo_provider", provider);
      localStorage.setItem("xiaomimimo_base_url", baseUrl);
    }

    // Try saving to backend config file
    try {
      await saveApiKeyTauri(provider, key, baseUrl);
    } catch (e) {
      console.warn("Backend save_api_key failed (using localStorage fallback):", e);
    }

    // Build settings from defaults + what we know
    const current = get().settings;
    const settings: AppSettings = current
      ? { ...current, provider, baseUrl }
      : { ...defaultSettings, provider, baseUrl };

    // Immediately transition to configured state
    set({ settings, apiKey: key, apiKeySource: "manual", isConfigured: true });
  },

  clearKey: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("xiaomimimo_api_key");
      localStorage.removeItem("xiaomimimo_provider");
      localStorage.removeItem("xiaomimimo_base_url");
    }
    // Also delete from config.toml via backend
    try { await deleteApiKeyTauri("xiaomi"); } catch { /* non-critical */ }
    const { settings } = get();
    set({ apiKey: null, apiKeySource: null, isConfigured: false });
    if (!settings) {
      set({ loaded: false });
    }
  },
}));
