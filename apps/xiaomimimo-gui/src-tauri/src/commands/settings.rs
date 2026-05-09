use std::path::PathBuf;

use deepseek_config::{ConfigStore, ProviderKind};
use serde::{Deserialize, Serialize};

fn config_path() -> Result<PathBuf, String> {
    dirs::home_dir()
        .map(|h| h.join(".xiaomimimo").join("config.toml"))
        .ok_or_else(|| "Could not resolve home directory".to_string())
}

fn ensure_config_dir() -> Result<(), String> {
    let dir = dirs::home_dir()
        .map(|h| h.join(".xiaomimimo"))
        .ok_or_else(|| "Could not resolve home directory".to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| format!("Cannot create config dir: {e}"))
}

pub(crate) fn load_store() -> Result<ConfigStore, String> {
    let path = config_path()?;
    ensure_config_dir()?;
    ConfigStore::load(Some(path)).map_err(|e| format!("Failed to load config: {e}"))
}

fn mask_api_key(key: &str) -> String {
    let chars: Vec<char> = key.chars().collect();
    if chars.len() <= 8 {
        return "********".to_string();
    }
    let prefix: String = chars.iter().take(7).collect();
    let suffix: String = chars.iter().rev().take(3).collect::<Vec<_>>().into_iter().rev().collect();
    format!("{prefix}***{suffix}")
}

// ── AppSettings: must match TypeScript `AppSettings` in `src/lib/types.ts` ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub provider: String,
    pub base_url: String,
    pub default_model: String,
    pub coding_model: String,
    pub vision_model: String,
    pub tts_model: String,
    #[serde(default = "default_true")]
    pub require_approval_for_files: bool,
    #[serde(default = "default_true")]
    pub require_approval_for_shell: bool,
    #[serde(default = "default_true")]
    pub require_approval_for_git: bool,
    #[serde(default = "default_true")]
    pub require_approval_for_mcp: bool,
    #[serde(default)]
    pub allow_yolo: bool,
    #[serde(default = "default_sandbox")]
    pub artifact_sandbox: String,
    #[serde(default)]
    pub tts_enabled: bool,
    #[serde(default = "default_voice")]
    pub tts_voice: String,
    #[serde(default = "default_speed")]
    pub tts_speed: f64,
    // extra UI fields
    #[serde(default)]
    pub api_key_preview: String,
    #[serde(default = "default_disconnected")]
    pub connection_status: String,
}

fn default_true() -> bool { true }
fn default_sandbox() -> String { "strict".to_string() }
fn default_voice() -> String { "professional_cn".to_string() }
fn default_speed() -> f64 { 1.0 }
fn default_disconnected() -> String { "disconnected".to_string() }

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            provider: "xiaomi".to_string(),
            base_url: "https://api.xiaomimimo.com/v1".to_string(),
            default_model: "mimo-v2.5-pro".to_string(),
            coding_model: "mimo-v2.5-pro".to_string(),
            vision_model: "mimo-v2-omni".to_string(),
            tts_model: "mimo-v2.5-tts".to_string(),
            require_approval_for_files: true,
            require_approval_for_shell: true,
            require_approval_for_git: true,
            require_approval_for_mcp: true,
            allow_yolo: false,
            artifact_sandbox: "strict".to_string(),
            tts_enabled: false,
            tts_voice: "professional_cn".to_string(),
            tts_speed: 1.0,
            api_key_preview: String::new(),
            connection_status: "disconnected".to_string(),
        }
    }
}

// ── Commands ──

#[tauri::command]
pub fn get_settings() -> Result<AppSettings, String> {
    let store = match load_store() {
        Ok(s) => s,
        Err(_) => return Ok(AppSettings::default()),
    };
    let config = &store.config;
    let provider = config.provider;
    let provider_cfg = config.providers.for_provider(provider);

    let api_key_preview = provider_cfg
        .api_key
        .as_ref()
        .filter(|k| !k.trim().is_empty())
        .map(|k| mask_api_key(k))
        .unwrap_or_default();

    let base_url = provider_cfg
        .base_url
        .clone()
        .or_else(|| config.base_url.clone())
        .unwrap_or_else(|| "https://api.xiaomimimo.com/v1".to_string());

    let model = provider_cfg
        .model
        .clone()
        .or_else(|| config.default_text_model.clone())
        .unwrap_or_else(|| "mimo-v2.5-pro".to_string());

    Ok(AppSettings {
        provider: provider.as_str().to_string(),
        base_url,
        default_model: model,
        coding_model: provider_cfg.model.clone().unwrap_or_else(|| "mimo-v2.5-pro".to_string()),
        vision_model: "mimo-v2-omni".to_string(),
        tts_model: "mimo-v2.5-tts".to_string(),
        connection_status: if api_key_preview.is_empty() { "disconnected".to_string() } else { "connected".to_string() },
        api_key_preview,
        ..AppSettings::default()
    })
}

#[tauri::command]
pub fn update_settings(settings: AppSettings) -> Result<(), String> {
    let mut store = load_store()?;
    let config = &mut store.config;

    let provider = ProviderKind::parse(&settings.provider).unwrap_or(ProviderKind::Xiaomi);
    config.provider = provider;
    let provider_cfg = config.providers.for_provider_mut(provider);
    provider_cfg.model = Some(settings.default_model);
    provider_cfg.base_url = Some(settings.base_url);

    // Write extras
    config.extras.insert("coding_model".to_string(), toml::Value::String(settings.coding_model));
    config.extras.insert("vision_model".to_string(), toml::Value::String(settings.vision_model));
    config.extras.insert("tts_model".to_string(), toml::Value::String(settings.tts_model));
    config.extras.insert("tts_voice".to_string(), toml::Value::String(settings.tts_voice));
    config.extras.insert("tts_speed".to_string(), toml::Value::Float(settings.tts_speed));
    config.extras.insert("artifact_sandbox".to_string(), toml::Value::String(settings.artifact_sandbox));
    config.extras.insert("require_approval_for_files".to_string(), toml::Value::Boolean(settings.require_approval_for_files));
    config.extras.insert("require_approval_for_shell".to_string(), toml::Value::Boolean(settings.require_approval_for_shell));
    config.extras.insert("require_approval_for_git".to_string(), toml::Value::Boolean(settings.require_approval_for_git));
    config.extras.insert("require_approval_for_mcp".to_string(), toml::Value::Boolean(settings.require_approval_for_mcp));
    config.extras.insert("allow_yolo".to_string(), toml::Value::Boolean(settings.allow_yolo));
    config.extras.insert("tts_enabled".to_string(), toml::Value::Boolean(settings.tts_enabled));

    store.save().map_err(|e| format!("Failed to save config: {e}"))
}

// ── save_api_key ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveApiKeyRequest {
    pub provider: String,
    pub api_key: String,
    pub base_url: String,
}

#[tauri::command]
pub fn save_api_key(req: SaveApiKeyRequest) -> Result<(), String> {
    ensure_config_dir()?;
    let mut store = load_store()?;
    let config = &mut store.config;

    let provider = ProviderKind::parse(&req.provider).unwrap_or(ProviderKind::Xiaomi);
    config.provider = provider;
    let provider_cfg = config.providers.for_provider_mut(provider);

    if req.api_key.is_empty() {
        provider_cfg.api_key = None;
    } else {
        provider_cfg.api_key = Some(req.api_key);
    }

    if !req.base_url.is_empty() {
        provider_cfg.base_url = Some(req.base_url);
    }

    store.save().map_err(|e| format!("Failed to save config: {e}"))
}

// ── test_connection ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionTestResult {
    #[serde(alias = "success")]
    pub ok: bool,
    pub message: String,
}

#[tauri::command]
pub async fn test_connection(req: SaveApiKeyRequest) -> Result<ConnectionTestResult, String> {
    let api_key = req.api_key;
    let base_url = if req.base_url.is_empty() {
        "https://api.xiaomimimo.com/v1".to_string()
    } else {
        req.base_url
    };

    if api_key.trim().is_empty() {
        return Ok(ConnectionTestResult { ok: false, message: "API key is empty".to_string() });
    }

    let url = format!("{}/models", base_url.trim_end_matches('/'));

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .danger_accept_invalid_certs(false)
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    match client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key.trim()))
        .send()
        .await
    {
        Ok(resp) => {
            let status = resp.status();
            if status.is_success() {
                Ok(ConnectionTestResult { ok: true, message: "Connection successful".to_string() })
            } else {
                let body = resp.text().await.unwrap_or_default();
                Ok(ConnectionTestResult { ok: false, message: format!("HTTP {}: {}", status.as_u16(), body) })
            }
        }
        Err(e) => {
            Ok(ConnectionTestResult { ok: false, message: format!("Connection failed: {e}") })
        }
    }
}

// ── delete_api_key ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteApiKeyRequest {
    pub provider: String,
}

#[tauri::command]
pub fn delete_api_key(req: DeleteApiKeyRequest) -> Result<(), String> {
    let mut store = load_store()?;
    let config = &mut store.config;
    let provider = ProviderKind::parse(&req.provider).unwrap_or(ProviderKind::Xiaomi);
    config.providers.for_provider_mut(provider).api_key = None;
    store.save().map_err(|e| format!("Failed to save config: {e}"))
}

// ── get_onboarding_status ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStatus {
    pub api_key_configured: bool,
    pub provider: String,
}

#[tauri::command]
pub fn get_onboarding_status() -> Result<OnboardingStatus, String> {
    let store = match load_store() {
        Ok(s) => s,
        Err(_) => return Ok(OnboardingStatus { api_key_configured: false, provider: "xiaomi".to_string() }),
    };
    let config = &store.config;
    let provider = config.provider;
    let provider_cfg = config.providers.for_provider(provider);
    let configured = provider_cfg.api_key.as_ref().map_or(false, |k| !k.trim().is_empty());

    Ok(OnboardingStatus { api_key_configured: configured, provider: provider.as_str().to_string() })
}
