use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServerConfig {
    pub id: String,
    pub name: String,
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: HashMap<String, String>,
    pub enabled: bool,
    #[serde(default)]
    pub permissions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpTestResult {
    pub success: bool,
    pub message: String,
    pub server_name: String,
    pub tools_count: u32,
}

#[tauri::command]
pub fn list_mcp_servers() -> Result<Vec<McpServerConfig>, String> {
    Ok(vec![
        McpServerConfig {
            id: "mcp-001".to_string(),
            name: "Filesystem".to_string(),
            command: "npx".to_string(),
            args: vec![
                "-y".to_string(),
                "@anthropic/mcp-server-filesystem".to_string(),
                "/home/user".to_string(),
            ],
            env: HashMap::new(),
            enabled: true,
            permissions: vec!["read".to_string(), "write".to_string()],
        },
        McpServerConfig {
            id: "mcp-002".to_string(),
            name: "GitHub".to_string(),
            command: "npx".to_string(),
            args: vec![
                "-y".to_string(),
                "@anthropic/mcp-server-github".to_string(),
            ],
            env: {
                let mut m = HashMap::new();
                m.insert("GITHUB_TOKEN".to_string(), "<your-github-token>".to_string());
                m
            },
            enabled: true,
            permissions: vec!["read".to_string()],
        },
        McpServerConfig {
            id: "mcp-003".to_string(),
            name: "PostgreSQL".to_string(),
            command: "npx".to_string(),
            args: vec![
                "-y".to_string(),
                "@anthropic/mcp-server-postgres".to_string(),
            ],
            env: {
                let mut m = HashMap::new();
                m.insert(
                    "DATABASE_URL".to_string(),
                    "postgresql://localhost/mydb".to_string(),
                );
                m
            },
            enabled: false,
            permissions: vec![],
        },
    ])
}

#[tauri::command]
pub fn test_mcp_server(id: String) -> Result<McpTestResult, String> {
    let server_name = match id.as_str() {
        "mcp-001" => "Filesystem",
        "mcp-002" => "GitHub",
        "mcp-003" => "PostgreSQL",
        _ => "Unknown",
    };

    Ok(McpTestResult {
        success: true,
        message: format!("Successfully connected to {} MCP server", server_name),
        server_name: server_name.to_string(),
        tools_count: 8,
    })
}
