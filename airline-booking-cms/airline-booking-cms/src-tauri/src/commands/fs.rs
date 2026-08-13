use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::command;

#[derive(Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
}

#[command]
pub async fn read_file(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    tokio::fs::write(&path, &content)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();
    let mut read_dir = tokio::fs::read_dir(&path)
        .await
        .map_err(|e| e.to_string())?;

    while let Some(entry) = read_dir.next_entry().await.map_err(|e| e.to_string())? {
        let metadata = entry.metadata().await.map_err(|e| e.to_string())?;
        entries.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
        });
    }

    entries.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.cmp(&b.name)
        }
    });

    Ok(entries)
}

#[command]
pub async fn create_file(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if let Some(parent) = p.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| e.to_string())?;
    }
    tokio::fs::write(&path, "")
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if p.is_dir() {
        tokio::fs::remove_dir_all(&path)
            .await
            .map_err(|e| e.to_string())
    } else {
        tokio::fs::remove_file(&path)
            .await
            .map_err(|e| e.to_string())
    }
}

#[command]
pub async fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    tokio::fs::rename(&old_path, &new_path)
        .await
        .map_err(|e| e.to_string())
}
