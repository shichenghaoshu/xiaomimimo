use serde::{Deserialize, Serialize};

// ── Request types: must match TypeScript ChatRequest ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatRequest {
    pub session_id: String,
    pub message: String,
    #[serde(default)]
    pub history: Vec<HistoryMessage>,
    #[serde(default)]
    pub attachments: Vec<Attachment>,
    #[serde(default)]
    pub mode: String,
    pub model: Option<String>,
    #[serde(default)]
    pub tts_enabled: bool,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Attachment {
    pub id: String,
    #[serde(rename = "type")]
    pub att_type: String,
    pub name: String,
    #[serde(default)]
    pub path: Option<String>,
    #[serde(default)]
    pub mime: Option<String>,
    #[serde(default)]
    pub size: Option<u64>,
}

// ── Response types: must match TypeScript ChatResponse ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatResponse {
    pub message_id: String,
    pub content: String,
    pub reasoning: Option<String>,
    #[serde(default)]
    pub tool_calls: Vec<ToolCall>,
    #[serde(default)]
    pub artifacts: Vec<serde_json::Value>,
    pub usage: Option<TokenUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolCall {
    pub id: String,
    pub name: String,
    pub status: String,       // "pending" | "running" | "success" | "failed" | "rejected"
    pub args_preview: String,
    pub result_preview: Option<String>,
    pub requires_approval: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenUsage {
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub total_tokens: u64,
    #[serde(default)]
    pub cache_hit_tokens: Option<u64>,
    #[serde(default)]
    pub cache_miss_tokens: Option<u64>,
    #[serde(default)]
    pub estimated_cost: Option<f64>,
}

// ── Session types: must match TypeScript ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Message {
    pub id: String,
    pub role: String,
    pub content: String,
    pub reasoning: Option<String>,
    #[serde(default)]
    pub tool_calls: Vec<ToolCall>,
    #[serde(default)]
    pub artifact_ids: Vec<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionSummary {
    pub id: String,
    pub title: String,
    pub model: String,
    pub message_count: u32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub id: String,
    pub title: String,
    pub model: String,
    pub messages: Vec<Message>,
    #[serde(default)]
    pub artifacts: Vec<serde_json::Value>,
    pub created_at: String,
    pub updated_at: String,
}

// ── Real API call ──

async fn try_real_chat(
    message: &str,
    history: &[HistoryMessage],
    model: Option<&str>,
    api_key: &str,
    base_url: &str,
) -> Result<ChatResponse, String> {
    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    let mut messages: Vec<serde_json::Value> = history
        .iter()
        .map(|h| serde_json::json!({"role": h.role, "content": h.content}))
        .collect();
    messages.push(serde_json::json!({"role": "user", "content": message}));

    let body = serde_json::json!({
        "model": model.unwrap_or("mimo-v2.5-pro"),
        "messages": messages,
        "max_tokens": 8192,
    });

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let resp = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key.trim()))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("API request failed: {e}"))?;

    if !resp.status().is_success() {
        let s = resp.status();
        let b = resp.text().await.unwrap_or_default();
        return Err(format!("API {}: {}", s.as_u16(), b));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| format!("JSON parse: {e}"))?;
    let content = json["choices"][0]["message"]["content"].as_str().unwrap_or("").to_string();
    let reasoning = json["choices"][0]["message"]["reasoning_content"].as_str().map(String::from);
    let prompt_tokens = json["usage"]["prompt_tokens"].as_u64().unwrap_or(0);
    let completion_tokens = json["usage"]["completion_tokens"].as_u64().unwrap_or(0);

    Ok(ChatResponse {
        message_id: uuid::Uuid::new_v4().to_string(),
        content,
        reasoning,
        tool_calls: vec![],
        artifacts: vec![],
        usage: Some(TokenUsage {
            input_tokens: prompt_tokens,
            output_tokens: completion_tokens,
            total_tokens: prompt_tokens + completion_tokens,
            cache_hit_tokens: json["usage"]["prompt_tokens_details"]["cached_tokens"].as_u64(),
            cache_miss_tokens: None,
            estimated_cost: None,
        }),
    })
}

// ── Commands ──

#[tauri::command]
pub async fn send_chat_message(req: ChatRequest) -> Result<ChatResponse, String> {
    // Use apiKey from request (passed from frontend localStorage) or config file
    let api_key = req.api_key.clone()
        .filter(|k| !k.trim().is_empty())
        .or_else(|| {
            super::settings::load_store().ok().and_then(|store| {
                store.config.providers.xiaomi.api_key.clone()
            })
        });

    let base_url = req.base_url.clone()
        .filter(|u| !u.trim().is_empty())
        .or_else(|| {
            super::settings::load_store().ok().and_then(|store| {
                store.config.providers.xiaomi.base_url.clone()
            })
        })
        .unwrap_or_else(|| "https://api.xiaomimimo.com/v1".to_string());

    if let Some(key) = api_key {
        match try_real_chat(&req.message, &req.history, req.model.as_deref(), &key, &base_url).await {
            Ok(resp) => return Ok(resp),
            Err(e) => {
                return Ok(ChatResponse {
                    message_id: format!("err-{}", uuid::Uuid::new_v4()),
                    content: format!("API Error: {e}"),
                    reasoning: None,
                    tool_calls: vec![],
                    artifacts: vec![],
                    usage: None,
                });
            }
        }
    }
    // Mock fallback
    let msg_id = format!("msg-{}", uuid::Uuid::new_v4());
    Ok(ChatResponse {
        message_id: msg_id,
        content: format!(
            "I received: \"{}\"\n\nHere's a mock reply demonstrating markdown, code blocks, and reasoning.\n\n```rust\nfn main() {{\n    println!(\"Hello from MiMo!\");\n}}\n```\n\nSet your API key in Settings to get real responses.",
            req.message
        ),
        reasoning: Some("Analyzing the user's request...\n• Identified key topics\n• Checked relevant context\n• Formulated a helpful response".to_string()),
        tool_calls: vec![
            ToolCall {
                id: "tc-1".to_string(),
                name: "read_file".to_string(),
                status: "success".to_string(),
                args_preview: "{\"path\": \"src/main.rs\"}".to_string(),
                result_preview: Some("12 lines read".to_string()),
                requires_approval: false,
            },
        ],
        artifacts: vec![],
        usage: Some(TokenUsage {
            input_tokens: 500,
            output_tokens: 200,
            total_tokens: 700,
            cache_hit_tokens: Some(300),
            cache_miss_tokens: Some(200),
            estimated_cost: Some(0.001),
        }),
    })
}

#[tauri::command]
pub fn list_sessions() -> Result<Vec<SessionSummary>, String> {
    Ok(vec![SessionSummary {
        id: "session-001".to_string(),
        title: "Mock Session".to_string(),
        model: "mimo-v2.5-pro".to_string(),
        message_count: 3,
        created_at: "2026-05-01T00:00:00Z".to_string(),
        updated_at: "2026-05-09T00:00:00Z".to_string(),
    }])
}

#[tauri::command]
pub fn load_session(_session_id: String) -> Result<Session, String> {
    Ok(Session {
        id: _session_id,
        title: "Mock Session".to_string(),
        model: "mimo-v2.5-pro".to_string(),
        messages: vec![],
        artifacts: vec![],
        created_at: "2026-05-01T00:00:00Z".to_string(),
        updated_at: "2026-05-09T00:00:00Z".to_string(),
    })
}
