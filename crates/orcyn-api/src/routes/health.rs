use axum::Json;
use axum::extract::State;
use serde_json::{Value, json};

use crate::error::ApiError;
use crate::state::AppState;

/// Liveness: "is the process alive?"
///
/// Kubernetes restarts the pod if this fails. It deliberately does NOT check
/// the database: if Postgres is down, restarting the API won't fix it.
pub async fn live() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

/// Readiness: "can this instance serve traffic right now?"
///
/// Kubernetes stops sending traffic to the pod while this fails, without
/// restarting it.
pub async fn ready(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    sqlx::query("SELECT 1")
        .execute(&state.db)
        .await
        .map_err(|err| {
            tracing::warn!(error = %err, "readiness check: database unreachable");
            ApiError::Unavailable("database unreachable")
        })?;

    Ok(Json(json!({ "status": "ok", "database": "ok" })))
}
