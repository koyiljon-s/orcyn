use std::time::Duration;

use clap::{Parser, ValueEnum};

/// Every setting can come from a flag or an environment variable (`env = ...`).
/// Flags win. Locally the env vars come from `.env`; on Kubernetes from the pod spec.
#[derive(Debug, Parser)]
#[command(name = "orcyn-worker", about = "Proves Orcyn jobs with SP1")]
pub struct Config {
    /// Base URL of orcyn-api.
    #[arg(long, env = "ORCYN_WORKER_API_URL", default_value = "http://localhost:8080")]
    pub api_url: String,

    /// Shared worker token (must match the API's ORCYN_WORKER_TOKEN).
    #[arg(long, env = "ORCYN_WORKER_TOKEN", hide_env_values = true)]
    pub token: String,

    /// Name shown in job status, e.g. "gpu-worker-1". Defaults to $HOSTNAME,
    /// which on Kubernetes is the pod name.
    #[arg(long, env = "ORCYN_WORKER_ID")]
    pub worker_id: Option<String>,

    /// Which SP1 prover to use.
    #[arg(long, env = "ORCYN_WORKER_PROVER", value_enum, default_value = "mock")]
    pub prover: ProverKind,

    /// Seconds to wait before asking again when the queue is empty.
    #[arg(long, env = "ORCYN_WORKER_POLL_SECS", default_value_t = 2)]
    pub poll_secs: u64,

    /// Seconds between heartbeats while working. Must be well below the API's lease (60s).
    #[arg(long, env = "ORCYN_WORKER_HEARTBEAT_SECS", default_value_t = 10)]
    pub heartbeat_secs: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, ValueEnum)]
pub enum ProverKind {
    /// Runs the program, returns a fake proof instantly. Development only.
    Mock,
    /// Real proofs on the CPU. Slow, needs lots of RAM.
    Cpu,
    /// Real proofs on an NVIDIA GPU. Requires the `cuda` build feature.
    Cuda,
}

impl Config {
    pub fn worker_id(&self) -> String {
        self.worker_id
            .clone()
            .or_else(|| std::env::var("HOSTNAME").ok())
            .unwrap_or_else(|| "worker-local".to_string())
    }

    pub fn poll_interval(&self) -> Duration {
        Duration::from_secs(self.poll_secs)
    }

    pub fn heartbeat_interval(&self) -> Duration {
        Duration::from_secs(self.heartbeat_secs)
    }
}
