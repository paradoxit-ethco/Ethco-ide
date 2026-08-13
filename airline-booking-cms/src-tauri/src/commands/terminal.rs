use crate::terminal::pty::PtyManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{command, AppHandle, Emitter, State};
use tokio::sync::Mutex;

pub struct TerminalState {
    pub pty: Arc<Mutex<Option<PtyManager>>>,
}

#[derive(Serialize, Deserialize)]
pub struct PtyInfo {
    pub id: String,
    pub cols: u16,
    pub rows: u16,
}

#[command]
pub async fn create_pty(app: AppHandle) -> Result<PtyInfo, String> {
    let mut pty = PtyManager::new(80, 24).map_err(|e| e.to_string())?;

    let id = pty.id().to_string();
    let cols = pty.cols();
    let rows = pty.rows();

    let app_clone = app.clone();
    let reader = pty.reader().map_err(|e| e.to_string())?;

    tokio::spawn(async move {
        let mut buf = vec![0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(n) if n > 0 => {
                    let output = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_clone.emit("terminal-output", output);
                }
                Ok(_) => break,
                Err(_) => break,
            }
        }
    });

    Ok(PtyInfo { id, cols, rows })
}

#[command]
pub async fn write_pty(input: String) -> Result<(), String> {
    // In production, look up the PTY by ID from a registry
    // For now, placeholder — terminals will be connected via Tauri events
    Err("Not yet implemented: PTY write routing".to_string())
}

#[command]
pub async fn resize_pty(cols: u16, rows: u16) -> Result<(), String> {
    // Placeholder — resize routing
    Ok(())
}
