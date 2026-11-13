use anyhow::Context;
use tokio::net::TcpListener;
use tracing_subscriber::EnvFilter;

use orcyn_api::config::Config;
use orcyn_api::state::AppState;
use orcyn_api::{db, routes};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load crates/orcyn-api/.env if present (local dev), whatever folder you run from.
    // CARGO_MANIFEST_DIR is this crate's folder, fixed at compile time.
    // On Kubernetes the file doesn't exist and vars are injected instead.
    // Variables already set in the environment are never overwritten.
    dotenvy::from_path(concat!(env!("CARGO_MANIFEST_DIR"), "/.env")).ok();

    // Log level comes from RUST_LOG, e.g. "orcyn_api=debug,tower_http=info".
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = Config::from_env()?;

    let db = db::connect(&config.database_url).await?;
    tracing::info!("database ready, migrations applied");

    let app = routes::router(AppState { db });

    let listener = TcpListener::bind(config.bind_addr)
        .await
        .with_context(|| format!("failed to bind {}", config.bind_addr))?;
    tracing::info!("orcyn-api listening on http://{}", config.bind_addr);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .context("server error")?;

    tracing::info!("shut down cleanly");
    Ok(())
}

/// Resolves when the process is asked to stop.
///
/// Ctrl+C locally; SIGTERM on Kubernetes (sent before a pod is removed).
/// Graceful shutdown lets in-flight requests finish instead of being cut off.
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to listen for Ctrl+C");
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
    tracing::info!("shutdown signal received");
}
