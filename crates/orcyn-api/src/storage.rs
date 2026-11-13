//! Artifact storage: ELFs, stdin, proofs.
//!
//! An enum with one variant per backend. `Gcs` gets added in slice 5; the
//! rest of the code only calls `put`/`get` and never knows which backend runs.

use std::path::PathBuf;

use anyhow::Context;

#[derive(Debug, Clone)]
pub enum ArtifactStore {
    /// Files on local disk. Development only.
    Local { root: PathBuf },
}

impl ArtifactStore {
    /// Stores `bytes` under `key` (e.g. "elfs/ab12…"), replacing any existing value.
    pub async fn put(&self, key: &str, bytes: &[u8]) -> anyhow::Result<()> {
        match self {
            ArtifactStore::Local { root } => {
                let path = root.join(key);
                if let Some(parent) = path.parent() {
                    tokio::fs::create_dir_all(parent)
                        .await
                        .with_context(|| format!("creating {}", parent.display()))?;
                }
                // Write to a temp file, then rename. A rename is atomic, so a
                // crash mid-write never leaves a half-written artifact behind.
                let tmp = path.with_extension("tmp");
                tokio::fs::write(&tmp, bytes)
                    .await
                    .with_context(|| format!("writing {}", tmp.display()))?;
                tokio::fs::rename(&tmp, &path)
                    .await
                    .with_context(|| format!("renaming to {}", path.display()))?;
                Ok(())
            }
        }
    }

    /// Reads the artifact stored under `key`.
    pub async fn get(&self, key: &str) -> anyhow::Result<Vec<u8>> {
        match self {
            ArtifactStore::Local { root } => {
                let path = root.join(key);
                tokio::fs::read(&path)
                    .await
                    .with_context(|| format!("reading {}", path.display()))
            }
        }
    }
}
