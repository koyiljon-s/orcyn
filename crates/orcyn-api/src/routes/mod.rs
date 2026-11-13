use axum::Router;
use axum::extract::DefaultBodyLimit;
use axum::routing::{get, post};
use tower_http::trace::TraceLayer;

use crate::state::AppState;

mod health;
mod me;
mod requests;
mod workers;

pub fn router(state: AppState) -> Router {
    // Axum's default body limit is 2 MB; ELFs and proofs can be bigger.
    // Raised only on the routes that receive uploads.
    let upload_limit = DefaultBodyLimit::max(state.config.max_upload_bytes);

    Router::new()
        .route("/health", get(health::live))
        .route("/ready", get(health::ready))
        // Users (API key)
        .route("/v1/me", get(me::me))
        .route(
            "/v1/requests",
            get(requests::list)
                .post(requests::create)
                .layer(upload_limit.clone()),
        )
        .route("/v1/requests/{id}", get(requests::get))
        .route("/v1/requests/{id}/proof", get(requests::proof))
        // Workers (worker token)
        .route("/v1/workers/claim", post(workers::claim))
        .route("/v1/workers/jobs/{id}/program", get(workers::program))
        .route("/v1/workers/jobs/{id}/stdin", get(workers::stdin))
        .route("/v1/workers/jobs/{id}/start", post(workers::start))
        .route("/v1/workers/jobs/{id}/heartbeat", post(workers::heartbeat))
        .route(
            "/v1/workers/jobs/{id}/submit",
            post(workers::submit).layer(upload_limit),
        )
        .route("/v1/workers/jobs/{id}/fail", post(workers::fail))
        // Logs every request: method, path, status, latency.
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
