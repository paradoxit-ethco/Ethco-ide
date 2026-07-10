mod commands;
mod sidecar;
mod terminal;

use sidecar::manager::OpenCodeManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub opencode: Arc<Mutex<Option<OpenCodeManager>>>,
}

pub fn run() {
    let state = AppState {
        opencode: Arc::new(Mutex::new(None)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::fs::read_file,
            commands::fs::write_file,
            commands::fs::list_directory,
            commands::fs::create_file,
            commands::fs::delete_file,
            commands::fs::rename_file,
            commands::terminal::create_pty,
            commands::terminal::write_pty,
            commands::terminal::resize_pty,
            commands::sidecar::get_status,
            commands::sidecar::restart_agent,
            commands::git::get_branch,
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let mut manager = OpenCodeManager::new(4096);
                match manager.start().await {
                    Ok(()) => {
                        let state = handle.state::<AppState>();
                        let mut oc = state.opencode.lock().await;
                        *oc = Some(manager);
                    }
                    Err(e) => {
                        eprintln!("Failed to start OpenCode sidecar: {}", e);
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Ethco IDE");
}
