use std::env;
use std::net::SocketAddr;
use std::path::PathBuf;

use anyhow::Context;

/// Settings read from environment variables.
///
/// Locally they come from `.env`; on Kubernetes from a ConfigMap/Secret.
#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub bind_addr: SocketAddr,
    /// Where the local artifact store keeps files.
    pub storage_dir: PathBuf,
    /// Max size of an upload (ELF + stdin, or a proof), in bytes.
    pub max_upload_bytes: usize,

    /// Shared secret workers send as `Authorization: Bearer <token>`.
    /// `None` disables the worker endpoints entirely.
    pub worker_token: Option<String>,
    /// How long a worker may go without a heartbeat before losing its job.
    pub lease_secs: u64,
    /// How many times a job is tried before it's marked failed for good.
    pub max_attempts: i32,
    /// How often the lease reaper looks for expired leases.
    pub reaper_interval_secs: u64,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let database_url = env::var("DATABASE_URL").context("DATABASE_URL must be set")?;

        let port: u16 = parse_or("ORCYN_API_PORT", 8080)?;

        // 0.0.0.0 = listen on all interfaces. Required inside containers:
        // 127.0.0.1 would only accept connections from inside the container itself.
        let bind_addr = SocketAddr::from(([0, 0, 0, 0], port));

        // Default: crates/orcyn-api/data/artifacts, whatever folder you run from.
        let storage_dir = env::var("ORCYN_STORAGE_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/data/artifacts")));

        let max_upload_mb: usize = parse_or("ORCYN_MAX_UPLOAD_MB", 64)?;

        let worker_token = env::var("ORCYN_WORKER_TOKEN")
            .ok()
            .filter(|token| !token.is_empty());

        Ok(Config {
            database_url,
            bind_addr,
            storage_dir,
            max_upload_bytes: max_upload_mb * 1024 * 1024,
            worker_token,
            lease_secs: parse_or("ORCYN_LEASE_SECS", 60)?,
            max_attempts: parse_or("ORCYN_MAX_ATTEMPTS", 3)?,
            reaper_interval_secs: parse_or("ORCYN_REAPER_INTERVAL_SECS", 10)?,
        })
    }
}

/// Reads an env var and parses it, or returns `default` if it isn't set.
fn parse_or<T: std::str::FromStr>(name: &str, default: T) -> anyhow::Result<T> {
    match env::var(name) {
        Ok(value) => value
            .parse()
            .map_err(|_| anyhow::anyhow!("{name} has an invalid value: {value:?}")),
        Err(_) => Ok(default),
    }
}
