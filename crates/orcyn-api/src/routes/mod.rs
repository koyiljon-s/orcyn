use axum::Router;
use axum::routing::get;
use tower_http::trace::TraceLayer;

use crate::state::AppState;

mod health;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health::live))
        .route("/ready", get(health::ready))
        // Logs every request: method, path, status, latency.
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
