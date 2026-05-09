mod commands;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::chat::send_chat_message,
            commands::chat::list_sessions,
            commands::chat::load_session,
            commands::artifact::create_artifact,
            commands::artifact::list_artifacts,
            commands::workspace::list_workspace_files,
            commands::workspace::get_git_status,
            commands::workspace::get_git_diff,
            commands::workspace::run_shell_command,
            commands::context::get_context_stats,
            commands::mcp::list_mcp_servers,
            commands::mcp::test_mcp_server,
            commands::voice::tts_speak,
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::save_api_key,
            commands::settings::delete_api_key,
            commands::settings::test_connection,
            commands::settings::get_onboarding_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running xiaomimimo-gui");
}
