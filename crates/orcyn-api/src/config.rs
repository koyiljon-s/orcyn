use std::env;
use std::net::SocketAddr;

use anyhow::Context;

/// Settings read from environment variables.
///
/// Locally they come from `.env`; on Kubernetes from a ConfigMap/Secret.
#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub bind_addr: SocketAddr,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let database_url = env::var("DATABASE_URL").context("DATABASE_URL must be set")?;

        let port: u16 = env::var("ORCYN_API_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .context("ORCYN_API_PORT must be a number between 0 and 65535")?;

        // 0.0.0.0 = listen on all interfaces. Required inside containers:
        // 127.0.0.1 would only accept connections from inside the container itself.
        let bind_addr = SocketAddr::from(([0, 0, 0, 0], port));

        Ok(Config {
            database_url,
            bind_addr,
        })
    }
}
