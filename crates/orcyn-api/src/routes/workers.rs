//! Worker protocol endpoints. Only callable with the worker token.

use axum::Json;
use axum::body::Bytes;
use axum::extract::{Path, State};
use axum::http::{StatusCode, header};
use axum::response::{IntoResponse, Response};
use orcyn_types::{FailJobRequest, FailJobResponse, HeartbeatResponse};
use uuid::Uuid;

use crate::auth::AuthedWorker;
use crate::error::ApiError;
use crate::services::queue::{self, JobInput};
use crate::state::AppState;

/// POST /v1/workers/claim → 200 + ClaimedJob, or 204 if the queue is empty.
pub async fn claim(
    State(state): State<AppState>,
    worker: AuthedWorker,
) -> Result<Response, ApiError> {
    Ok(match queue::claim(&state, &worker).await? {
        Some(job) => Json(job).into_response(),
        None => StatusCode::NO_CONTENT.into_response(),
    })
}

/// GET /v1/workers/jobs/{id}/program → ELF bytes
pub async fn program(
    State(state): State<AppState>,
    worker: AuthedWorker,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, ApiError> {
    let bytes = queue::download_input(&state, &worker, id, JobInput::Program).await?;
    Ok(([(header::CONTENT_TYPE, "application/octet-stream")], bytes))
}

/// GET /v1/workers/jobs/{id}/stdin → stdin bytes
pub async fn stdin(
    State(state): State<AppState>,
    worker: AuthedWorker,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, ApiError> {
    let bytes = queue::download_input(&state, &worker, id, JobInput::Stdin).await?;
    Ok(([(header::CONTENT_TYPE, "application/octet-stream")], bytes))
}

/// POST /v1/workers/jobs/{id}/start → 204
pub async fn start(
    State(state): State<AppState>,
    worker: AuthedWorker,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, ApiError> {
    queue::start(&state, &worker, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

/// POST /v1/workers/jobs/{id}/heartbeat → new lease expiry
pub async fn heartbeat(
    State(state): State<AppState>,
    worker: AuthedWorker,
    Path(id): Path<Uuid>,
) -> Result<Json<HeartbeatResponse>, ApiError> {
    Ok(Json(queue::heartbeat(&state, &worker, id).await?))
}

/// POST /v1/workers/jobs/{id}/submit (body: raw proof bytes) → 204
pub async fn submit(
    State(state): State<AppState>,
    worker: AuthedWorker,
    Path(id): Path<Uuid>,
    proof: Bytes,
) -> Result<StatusCode, ApiError> {
    queue::submit(&state, &worker, id, &proof).await?;
    Ok(StatusCode::NO_CONTENT)
}

/// POST /v1/workers/jobs/{id}/fail (body: FailJobRequest JSON) → FailJobResponse
pub async fn fail(
    State(state): State<AppState>,
    worker: AuthedWorker,
    Path(id): Path<Uuid>,
    Json(request): Json<FailJobRequest>,
) -> Result<Json<FailJobResponse>, ApiError> {
    Ok(Json(queue::fail(&state, &worker, id, request).await?))
}
