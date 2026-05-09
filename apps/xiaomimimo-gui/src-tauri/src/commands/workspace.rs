use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    #[serde(default)]
    pub children: Vec<FileNode>,
    #[serde(default)]
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatus {
    pub branch: String,
    pub changes: Vec<GitChange>,
    #[serde(default)]
    pub is_clean: bool,
    #[serde(default)]
    pub ahead: u32,
    #[serde(default)]
    pub behind: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitChange {
    pub path: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShellCommandRequest {
    pub command: String,
    pub cwd: String,
    #[serde(default)]
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShellCommandResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    #[serde(default)]
    pub duration_ms: u64,
}

#[tauri::command]
pub fn list_workspace_files(path: String) -> Result<Vec<FileNode>, String> {
    let _ = path;
    Ok(vec![
        FileNode {
            name: "src".to_string(),
            path: "/home/user/project/src".to_string(),
            is_dir: true,
            size: 4096,
            children: vec![
                FileNode {
                    name: "main.rs".to_string(),
                    path: "/home/user/project/src/main.rs".to_string(),
                    is_dir: false,
                    size: 2048,
                    children: vec![],
                },
                FileNode {
                    name: "lib.rs".to_string(),
                    path: "/home/user/project/src/lib.rs".to_string(),
                    is_dir: false,
                    size: 1024,
                    children: vec![],
                },
            ],
        },
        FileNode {
            name: "Cargo.toml".to_string(),
            path: "/home/user/project/Cargo.toml".to_string(),
            is_dir: false,
            size: 512,
            children: vec![],
        },
        FileNode {
            name: "README.md".to_string(),
            path: "/home/user/project/README.md".to_string(),
            is_dir: false,
            size: 256,
            children: vec![],
        },
    ])
}

#[tauri::command]
pub fn get_git_status(path: String) -> Result<GitStatus, String> {
    let _ = path;
    Ok(GitStatus {
        branch: "main".to_string(),
        changes: vec![
            GitChange {
                path: "src/main.rs".to_string(),
                status: "modified".to_string(),
            },
            GitChange {
                path: "Cargo.toml".to_string(),
                status: "modified".to_string(),
            },
            GitChange {
                path: "src/commands/chat.rs".to_string(),
                status: "added".to_string(),
            },
        ],
        is_clean: false,
        ahead: 2,
        behind: 0,
    })
}

#[tauri::command]
pub fn get_git_diff(path: String) -> Result<String, String> {
    let _ = path;
    Ok(
        "diff --git a/src/main.rs b/src/main.rs\n\
         index 1234567..abcdefg 100644\n\
         --- a/src/main.rs\n\
         +++ b/src/main.rs\n\
         @@ -1,3 +1,5 @@\n\
          fn main() {\n         -    println!(\"Hello\");\n\
         +    println!(\"Hello, world!\");\n\
         +    println!(\"New line added\");\n\
          }"
            .to_string(),
    )
}

#[tauri::command]
pub fn run_shell_command(req: ShellCommandRequest) -> Result<ShellCommandResult, String> {
    match req.command.as_str() {
        "cargo build" => Ok(ShellCommandResult {
            stdout: "   Compiling xiaomimimo-gui v0.1.0\n    Finished dev [unoptimized + debuginfo] target(s) in 2.34s".to_string(),
            stderr: String::new(),
            exit_code: 0,
            duration_ms: 2340,
        }),
        "cargo test" => Ok(ShellCommandResult {
            stdout: "running 12 tests\ntest test_chat ... ok\ntest test_workspace ... ok\n\nresult: ok. 12 passed; 0 failed".to_string(),
            stderr: String::new(),
            exit_code: 0,
            duration_ms: 1520,
        }),
        _ => Ok(ShellCommandResult {
            stdout: format!("Executed: {}", req.command),
            stderr: String::new(),
            exit_code: 0,
            duration_ms: 0,
        }),
    }
}
