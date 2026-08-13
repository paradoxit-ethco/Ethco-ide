use anyhow::Result;
use std::process::{Child, Command, Stdio};
use std::time::Duration;
use tokio::time::sleep;

pub struct OpenCodeManager {
    port: u16,
    process: Option<Child>,
    running: bool,
}

impl OpenCodeManager {
    pub fn new(port: u16) -> Self {
        Self {
            port,
            process: None,
            running: false,
        }
    }

    pub async fn start(&mut self) -> Result<()> {
        let binary = if cfg!(target_os = "windows") {
            "opencode-x86_64-pc-windows-msvc.exe"
        } else if cfg!(target_os = "macos") {
            if cfg!(target_arch = "aarch64") {
                "opencode-aarch64-apple-darwin"
            } else {
                "opencode-x86_64-apple-darwin"
            }
        } else {
            "opencode-x86_64-unknown-linux-gnu"
        };

        let child = Command::new(binary)
            .args(["--port", &self.port.to_string()])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| anyhow::anyhow!("Failed to spawn OpenCode sidecar: {}", e))?;

        self.process = Some(child);
        self.running = true;

        // Health check loop
        let port = self.port;
        tokio::spawn(async move {
            loop {
                sleep(Duration::from_secs(5)).await;
                match health_check(port).await {
                    Ok(true) => continue,
                    _ => {
                        eprintln!("OpenCode sidecar health check failed on port {}", port);
                        // In production: trigger restart via event
                    }
                }
            }
        });

        Ok(())
    }

    pub async fn restart(&mut self) -> Result<()> {
        self.stop().await;
        self.start().await
    }

    pub async fn stop(&mut self) {
        if let Some(mut child) = self.process.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
        self.running = false;
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn port(&self) -> u16 {
        self.port
    }
}

async fn health_check(port: u16) -> Result<bool> {
    match tokio::net::TcpStream::connect(format!("127.0.0.1:{}", port)).await {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

impl Drop for OpenCodeManager {
    fn drop(&mut self) {
        if let Some(mut child) = self.process.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}
