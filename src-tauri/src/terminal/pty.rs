use anyhow::Result;
use portable_pty::{ChildKiller, CommandBuilder, MasterPty, NativePtySystem, PtyPair, PtySize, PtySystem};
use std::io::Read;
use uuid::Uuid;

pub struct PtyManager {
    id: String,
    pair: Option<PtyPair>,
    child_killer: Option<Box<dyn ChildKiller + Send>>,
    cols: u16,
    rows: u16,
}

impl PtyManager {
    pub fn new(cols: u16, rows: u16) -> Result<Self> {
        let id = Uuid::new_v4().to_string();

        Ok(Self {
            id,
            pair: None,
            child_killer: None,
            cols,
            rows,
        })
    }

    pub fn spawn(&mut self, shell: Option<&str>) -> Result<()> {
        let pty_system = NativePtySystem::default();

        let pair = pty_system.openpty(PtySize {
            rows: self.rows,
            cols: self.cols,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        let shell_cmd = shell.unwrap_or(if cfg!(target_os = "windows") {
            "powershell.exe"
        } else {
            "/bin/bash"
        });

        let mut cmd = CommandBuilder::new(shell_cmd);
        if cfg!(target_os = "windows") {
            cmd.args(["-NoLogo", "-NoProfile"]);
        } else {
            cmd.args(["--login"]);
        }

        let child = pair.slave.spawn_command(cmd)?;
        self.child_killer = Some(child.killer());
        self.pair = Some(pair);

        Ok(())
    }

    pub fn writer(&mut self) -> Option<Box<dyn std::io::Write + Send>> {
        self.pair.as_mut().map(|p| p.master.take_writer().unwrap())
    }

    pub fn reader(&self) -> Result<Box<dyn Read + Send>> {
        self.pair
            .as_ref()
            .map(|p| p.master.try_clone_reader())
            .ok_or_else(|| anyhow::anyhow!("PTY not spawned"))?
            .map_err(|e| anyhow::anyhow!("Failed to clone reader: {}", e))
    }

    pub fn resize(&mut self, cols: u16, rows: u16) -> Result<()> {
        self.cols = cols;
        self.rows = rows;
        if let Some(pair) = &self.pair {
            pair.master
                .resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                })
                .map_err(|e| anyhow::anyhow!("Resize failed: {}", e))?;
        }
        Ok(())
    }

    pub fn kill(&mut self) {
        if let Some(killer) = self.child_killer.take() {
            let _ = killer.kill();
        }
    }

    pub fn id(&self) -> &str {
        &self.id
    }

    pub fn cols(&self) -> u16 {
        self.cols
    }

    pub fn rows(&self) -> u16 {
        self.rows
    }
}

impl Drop for PtyManager {
    fn drop(&mut self) {
        self.kill();
    }
}
