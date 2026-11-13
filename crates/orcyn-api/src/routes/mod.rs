use axum::Router;
use axum::extract::DefaultBodyLimit;
use axum::routing::get;
use tower_http::trace::TraceLayer;

use crate::state::AppState;

mod health;
mod me;
mod requests;

pub fn router(state: AppState, max_upload_bytes: usize) -> Router {
    Router::new()
        .route("/health", get(health::live))
        .route("/ready", get(health::ready))
        .route("/v1/me", get(me::me))
        .route(
            "/v1/requests",
            get(requests::list)
                // Axum's default body limit is 2 MB; ELFs can be bigger.
                // Raised only on the upload route.
                .post(requests::create)
                .layer(DefaultBodyLimit::max(max_upload_bytes)),
        )
        .route("/v1/requests/{id}", get(requests::get))
        // Logs every request: method, path, status, latency.
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
