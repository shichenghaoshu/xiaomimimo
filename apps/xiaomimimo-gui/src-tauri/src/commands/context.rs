use serde::{Deserialize, Serialize};

// ── Must match TypeScript ContextStats, ContextLayer, CacheStats ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextStats {
    pub total_tokens: u64,
    pub limit_tokens: u64,
    pub remaining_tokens: u64,
    #[serde(default)]
    pub layers: Vec<ContextLayer>,
    pub cache: CacheStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextLayer {
    pub name: String,
    pub tokens: u64,
    pub stable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CacheStats {
    pub stable_prefix_tokens: u64,
    pub estimated_hit_rate: f64,
    pub risk: String,
    pub recommendation: String,
}

#[tauri::command]
pub fn get_context_stats(_session_id: String) -> Result<ContextStats, String> {
    let token_count: u64 = 452_000;
    let token_limit: u64 = 1_000_000;

    Ok(ContextStats {
        total_tokens: token_count,
        limit_tokens: token_limit,
        remaining_tokens: token_limit.saturating_sub(token_count),
        layers: vec![
            ContextLayer {
                name: "System prompt".to_string(),
                tokens: 2_400,
                stable: true,
            },
            ContextLayer {
                name: "Conversation history".to_string(),
                tokens: 420_000,
                stable: false,
            },
            ContextLayer {
                name: "Artifacts".to_string(),
                tokens: 12_500,
                stable: true,
            },
            ContextLayer {
                name: "Tool outputs".to_string(),
                tokens: 17_100,
                stable: false,
            },
        ],
        cache: CacheStats {
            stable_prefix_tokens: 2_400,
            estimated_hit_rate: 0.65,
            risk: "low".to_string(),
            recommendation: "Cache is healthy with a 65% hit rate. Consider adding more stable context to improve efficiency.".to_string(),
        },
    })
}
