//! Coordinator rules: claiming, leases, retries, completing jobs.

use anyhow::Context;
use orcyn_types::{
    ClaimedJob, FailJobRequest, FailJobResponse, HeartbeatResponse, JobStatus, RequestId,
};
use uuid::Uuid;

use crate::auth::AuthedWorker;
use crate::error::ApiError;
use crate::repo::queue;
use crate::state::AppState;

/// Longest error message we keep from a worker.
const MAX_ERROR_LEN: usize = 2000;

fn not_held() -> ApiError {
    ApiError::Conflict(
        "job is not held by this worker (lease expired or job already finished)".into(),
    )
}

fn lease_secs(state: &AppState) -> f64 {
    state.config.lease_secs as f64
}

pub async fn claim(state: &AppState, worker: &AuthedWorker) -> Result<Option<ClaimedJob>, ApiError> {
    let Some(row) = queue::claim_next(&state.db, &worker.worker_id, lease_secs(state)).await? else {
        return Ok(None);
    };

    tracing::info!(
        request_id = %row.id,
        worker_id = %worker.worker_id,
        attempt = row.attempts,
        "job claimed"
    );

    Ok(Some(ClaimedJob {
        request_id: RequestId(row.id),
        mode: row.mode.parse().context("invalid mode in database")?,
        program_hash: row.program_hash,
        attempt: row.attempts,
        lease_expires_at: row.lease_expires_at,
    }))
}

pub enum JobInput {
    Program,
    Stdin,
}

/// The ELF or stdin of a job this worker holds.
pub async fn download_input(
    state: &AppState,
    worker: &AuthedWorker,
    id: Uuid,
    input: JobInput,
) -> Result<Vec<u8>, ApiError> {
    let keys = queue::artifact_keys_for_worker(&state.db, id, &worker.worker_id)
        .await?
        .ok_or_else(not_held)?;

    let key = match input {
        JobInput::Program => keys.elf_key,
        JobInput::Stdin => keys.stdin_key,
    };
    Ok(state.storage.get(&key).await?)
}

pub async fn start(state: &AppState, worker: &AuthedWorker, id: Uuid) -> Result<(), ApiError> {
    if !queue::start(&state.db, id, &worker.worker_id, lease_secs(state)).await? {
        return Err(not_held());
    }
    tracing::info!(request_id = %id, worker_id = %worker.worker_id, "proving started");
    Ok(())
}

pub async fn heartbeat(
    state: &AppState,
    worker: &AuthedWorker,
    id: Uuid,
) -> Result<HeartbeatResponse, ApiError> {
    let lease_expires_at = queue::heartbeat(&state.db, id, &worker.worker_id, lease_secs(state))
        .await?
        .ok_or_else(not_held)?;
    Ok(HeartbeatResponse { lease_expires_at })
}

pub async fn submit(
    state: &AppState,
    worker: &AuthedWorker,
    id: Uuid,
    proof: &[u8],
) -> Result<(), ApiError> {
    if proof.is_empty() {
        return Err(ApiError::BadRequest("proof is empty".into()));
    }

    // Cheap ownership check first, so we don't store proofs for jobs we'd reject.
    queue::artifact_keys_for_worker(&state.db, id, &worker.worker_id)
        .await?
        .ok_or_else(not_held)?;

    let proof_key = format!("proofs/{id}");
    state.storage.put(&proof_key, proof).await?;

    // The lease could still expire between the check above and this update;
    // `complete` re-checks ownership atomically.
    if !queue::complete(&state.db, id, &worker.worker_id, &proof_key).await? {
        return Err(not_held());
    }

    tracing::info!(request_id = %id, worker_id = %worker.worker_id, bytes = proof.len(), "proof fulfilled");
    Ok(())
}

pub async fn fail(
    state: &AppState,
    worker: &AuthedWorker,
    id: Uuid,
    request: FailJobRequest,
) -> Result<FailJobResponse, ApiError> {
    let error: String = request.error.chars().take(MAX_ERROR_LEN).collect();

    let status = queue::fail(
        &state.db,
        id,
        &worker.worker_id,
        &error,
        request.retryable,
        state.config.max_attempts,
    )
    .await?
    .ok_or_else(not_held)?;

    let status: JobStatus = status.parse().context("invalid status in database")?;
    tracing::warn!(
        request_id = %id,
        worker_id = %worker.worker_id,
        new_status = status.as_str(),
        %error,
        "job failed on worker"
    );
    Ok(FailJobResponse { status })
}
