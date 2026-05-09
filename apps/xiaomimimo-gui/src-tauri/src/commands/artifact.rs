use serde::{Deserialize, Serialize};

// ── Must match TypeScript Artifact, ArtifactVersion ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateArtifactRequest {
    pub session_id: String,
    #[serde(rename = "type")]
    pub artifact_type: String,
    pub content: String,
    pub filename: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Artifact {
    pub id: String,
    pub session_id: String,
    pub title: String,
    /// Serialized as `type` on the wire to match TypeScript's `type` field.
    #[serde(rename = "type")]
    pub artifact_type: String,
    #[serde(default)]
    pub language: Option<String>,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
    #[serde(default)]
    pub versions: Vec<ArtifactVersion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArtifactVersion {
    pub id: String,
    pub content: String,
    pub created_at: String,
    #[serde(default)]
    pub label: Option<String>,
}

#[tauri::command]
pub fn create_artifact(req: CreateArtifactRequest) -> Result<Artifact, String> {
    let now = chrono::Utc::now().to_rfc3339();
    Ok(Artifact {
        id: uuid::Uuid::new_v4().to_string(),
        session_id: req.session_id,
        title: req.filename.clone(),
        artifact_type: req.artifact_type,
        language: None,
        content: req.content,
        created_at: now.clone(),
        updated_at: now,
        versions: vec![],
    })
}

#[tauri::command]
pub fn list_artifacts(session_id: String) -> Result<Vec<Artifact>, String> {
    let _ = session_id;
    Ok(vec![
        Artifact {
            id: "artifact-001".to_string(),
            session_id: "session-001".to_string(),
            title: "hello.rs".to_string(),
            artifact_type: "code".to_string(),
            language: Some("rust".to_string()),
            content: "fn main() {\n    println!(\"Hello, world!\");\n}".to_string(),
            created_at: "2026-05-08T14:00:00Z".to_string(),
            updated_at: "2026-05-08T14:00:00Z".to_string(),
            versions: vec![
                ArtifactVersion {
                    id: "ver-001".to_string(),
                    content: "fn main() {\n    println!(\"Hello\");\n}".to_string(),
                    created_at: "2026-05-08T13:55:00Z".to_string(),
                    label: Some("Initial revision".to_string()),
                },
            ],
        },
        Artifact {
            id: "artifact-002".to_string(),
            session_id: "session-001".to_string(),
            title: "README.md".to_string(),
            artifact_type: "document".to_string(),
            language: Some("markdown".to_string()),
            content: "# README\n\nThis is a generated document.".to_string(),
            created_at: "2026-05-08T14:10:00Z".to_string(),
            updated_at: "2026-05-08T14:10:00Z".to_string(),
            versions: vec![],
        },
    ])
}
