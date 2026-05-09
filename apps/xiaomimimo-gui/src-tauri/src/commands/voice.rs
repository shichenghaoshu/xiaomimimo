use serde::{Deserialize, Serialize};

// ── Must match TypeScript AudioOutput ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioOutput {
    pub id: String,
    pub format: String,
    pub duration: f64,
    #[serde(default)]
    pub data: Option<Vec<u32>>,
    #[serde(default)]
    pub url: Option<String>,
}

// ── TTS request params (internal to the command, sent from frontend) ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TtsRequest {
    pub text: String,
    #[serde(default = "default_voice")]
    pub voice: String,
    #[serde(default = "default_speed")]
    pub speed: f32,
}

fn default_voice() -> String { "professional_cn".to_string() }
fn default_speed() -> f32 { 1.0 }

#[tauri::command]
pub fn tts_speak(req: TtsRequest) -> Result<AudioOutput, String> {
    let duration = req.text.len() as f64 * 0.05 / req.speed as f64;

    Ok(AudioOutput {
        id: uuid::Uuid::new_v4().to_string(),
        format: "wav".to_string(),
        duration,
        data: None,
        url: Some("data:audio/wav;base64,<placeholder>".to_string()),
    })
}
