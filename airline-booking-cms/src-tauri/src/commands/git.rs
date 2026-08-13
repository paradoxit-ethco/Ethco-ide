use serde::Serialize;
use tauri::command;

#[derive(Serialize)]
pub struct GitBranchInfo {
    pub current: String,
    pub branches: Vec<String>,
}

#[command]
pub async fn get_branch(path: String) -> Result<GitBranchInfo, String> {
    match git2::Repository::open(&path) {
        Ok(repo) => {
            let current = repo
                .head()
                .ok()
                .and_then(|head| head.shorthand().map(|s| s.to_string()))
                .unwrap_or_default();

            let branches: Vec<String> = repo
                .branches(Some(git2::BranchType::Local))
                .ok()
                .map(|branches| {
                    branches
                        .filter_map(|b| b.ok())
                        .filter_map(|(b, _)| b.name().ok().flatten().map(|s| s.to_string()))
                        .collect()
                })
                .unwrap_or_default();

            Ok(GitBranchInfo { current, branches })
        }
        Err(_) => Ok(GitBranchInfo {
            current: "no repo".to_string(),
            branches: vec![],
        }),
    }
}
