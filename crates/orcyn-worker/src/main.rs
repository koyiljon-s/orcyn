//! orcyn-worker: asks orcyn-api for jobs, proves them with SP1, submits proofs.
//!
//!   cargo run -p orcyn-worker                 # settings from crates/orcyn-worker/.env
//!   cargo run -p orcyn-worker -- --prover cpu # override with a flag

use clap::Parser;
use tokio_util::sync::CancellationToken;
use tracing_subscriber::EnvFilter;

mod api;
mod config;
mod prover;
mod runner;

use api::ApiClient;
use config::Config;
use prover::Prover;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::from_path(concat!(env!("CARGO_MANIFEST_DIR"), "/.env")).ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = Config::parse();
    let worker_id = config.worker_id();
    let api = ApiClient::new(&config.api_url, &config.token, &worker_id)?;

    tracing::info!(prover = ?config.prover, "starting SP1 prover");
    let mut prover = Prover::new(config.prover).await?;
    tracing::info!(%worker_id, api = %config.api_url, "worker ready, waiting for jobs");

    // Cancelled on Ctrl+C / SIGTERM. Everything that waits also watches it.
    let shutdown = CancellationToken::new();
    tokio::spawn({
        let shutdown = shutdown.clone();
        async move {
            shutdown_signal().await;
            tracing::info!("shutdown signal received");
            shutdown.cancel();
        }
    });

    while !shutdown.is_cancelled() {
        match api.claim().await {
            Ok(Some(job)) => {
                runner::run_job(&api, &mut prover, job, config.heartbeat_interval(), &shutdown)
                    .await;
                continue; // ask for the next job right away
            }
            Ok(None) => {} // queue empty
            Err(err) => tracing::warn!(error = %err, "claim failed; is orcyn-api running?"),
        }

        // Wait before polling again, but wake up immediately on shutdown.
        tokio::select! {
            _ = tokio::time::sleep(config.poll_interval()) => {}
            _ = shutdown.cancelled() => {}
        }
    }

    tracing::info!("worker stopped");
    Ok(())
}

/// Ctrl+C locally; SIGTERM on Kubernetes (sent before a pod is removed).
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c().await.expect("failed to listen for Ctrl+C");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to listen for SIGTERM")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
