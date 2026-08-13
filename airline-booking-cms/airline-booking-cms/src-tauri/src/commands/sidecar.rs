use crate::AppState;
use serde::Serialize;
use tauri::command;
use tauri::State;

#[derive(Serialize)]
pub struct SidecarStatus {
    pub running: bool,
    pub port: u16,
}

#[command]
pub async fn get_status(state: State<'_, AppState>) -> Result<SidecarStatus, String> {
    let oc = state.opencode.lock().await;
    match oc.as_ref() {
        Some(manager) => Ok(SidecarStatus {
            running: manager.is_running(),
            port: manager.port(),
        }),
        None => Ok(SidecarStatus {
            running: false,
            port: 0,
        }),
    }
}

#[command]
pub async fn restart_agent(state: State<'_, AppState>) -> Result<(), String> {
    let mut oc = state.opencode.lock().await;
    if let Some(manager) = oc.as_mut() {
        manager.restart().await.map_err(|e| e.to_string())
    } else {
        Err("OpenCode sidecar not initialized".to_string())
    }
}
