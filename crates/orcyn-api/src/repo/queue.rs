//! Job queue queries on `proof_requests`: the coordinator's SQL.
//!
//! Every worker update includes `WHERE worker_id = $2 AND status ...`, so a
//! worker can only change a job it currently holds. If its lease expired and
//! the job moved on, the update matches no row and the worker is told so.

use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
pub struct ClaimedRow {
    pub id: Uuid,
    pub mode: String,
    pub program_hash: String,
    pub attempts: i32,
    pub lease_expires_at: DateTime<Utc>,
}

/// Atomically takes the oldest queued job and assigns it to `worker_id`.
///
/// `FOR UPDATE SKIP LOCKED`: the inner SELECT locks the row it picks, and
/// any other worker claiming at the same moment *skips* locked rows instead
/// of waiting. Two workers never get the same job, and nobody blocks.
pub async fn claim_next(
    db: &PgPool,
    worker_id: &str,
    lease_secs: f64,
) -> sqlx::Result<Option<ClaimedRow>> {
    sqlx::query_as(
        "UPDATE proof_requests
         SET status = 'assigned',
             worker_id = $1,
             attempts = attempts + 1,
             lease_expires_at = now() + make_interval(secs => $2),
             updated_at = now()
         WHERE id = (
             SELECT id FROM proof_requests
             WHERE status = 'queued'
             ORDER BY created_at
             LIMIT 1
             FOR UPDATE SKIP LOCKED
         )
         RETURNING id, mode, program_hash, attempts, lease_expires_at",
    )
    .bind(worker_id)
    .bind(lease_secs)
    .fetch_optional(db)
    .await
}

#[derive(Debug, sqlx::FromRow)]
pub struct JobArtifactKeys {
    pub elf_key: String,
    pub stdin_key: String,
}

/// Storage keys of a job this worker currently holds.
pub async fn artifact_keys_for_worker(
    db: &PgPool,
    id: Uuid,
    worker_id: &str,
) -> sqlx::Result<Option<JobArtifactKeys>> {
    sqlx::query_as(
        "SELECT elf_key, stdin_key FROM proof_requests
         WHERE id = $1 AND worker_id = $2 AND status IN ('assigned', 'proving')",
    )
    .bind(id)
    .bind(worker_id)
    .fetch_optional(db)
    .await
}

/// assigned → proving. Also renews the lease. Returns false if not held.
pub async fn start(db: &PgPool, id: Uuid, worker_id: &str, lease_secs: f64) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE proof_requests
         SET status = 'proving',
             lease_expires_at = now() + make_interval(secs => $3),
             updated_at = now()
         WHERE id = $1 AND worker_id = $2 AND status = 'assigned'",
    )
    .bind(id)
    .bind(worker_id)
    .bind(lease_secs)
    .execute(db)
    .await?;
    Ok(result.rows_affected() == 1)
}

/// Pushes the lease forward. Returns the new expiry, or None if not held.
pub async fn heartbeat(
    db: &PgPool,
    id: Uuid,
    worker_id: &str,
    lease_secs: f64,
) -> sqlx::Result<Option<DateTime<Utc>>> {
    sqlx::query_scalar(
        "UPDATE proof_requests
         SET lease_expires_at = now() + make_interval(secs => $3),
             updated_at = now()
         WHERE id = $1 AND worker_id = $2 AND status IN ('assigned', 'proving')
         RETURNING lease_expires_at",
    )
    .bind(id)
    .bind(worker_id)
    .bind(lease_secs)
    .fetch_optional(db)
    .await
}

/// proving → fulfilled. Keeps `worker_id` so users can see who proved it.
pub async fn complete(db: &PgPool, id: Uuid, worker_id: &str, proof_key: &str) -> sqlx::Result<bool> {
    let result = sqlx::query(
        "UPDATE proof_requests
         SET status = 'fulfilled',
             proof_key = $3,
             lease_expires_at = NULL,
             error = NULL,
             updated_at = now()
         WHERE id = $1 AND worker_id = $2 AND status = 'proving'",
    )
    .bind(id)
    .bind(worker_id)
    .bind(proof_key)
    .execute(db)
    .await?;
    Ok(result.rows_affected() == 1)
}

/// Worker gave up. Requeues if retryable and attempts remain, else fails.
/// Returns the new status ("queued" / "failed"), or None if not held.
pub async fn fail(
    db: &PgPool,
    id: Uuid,
    worker_id: &str,
    error: &str,
    retryable: bool,
    max_attempts: i32,
) -> sqlx::Result<Option<String>> {
    sqlx::query_scalar(
        "UPDATE proof_requests
         SET status = CASE WHEN $4 AND attempts < $5 THEN 'queued' ELSE 'failed' END,
             error = $3,
             worker_id = NULL,
             lease_expires_at = NULL,
             updated_at = now()
         WHERE id = $1 AND worker_id = $2 AND status IN ('assigned', 'proving')
         RETURNING status",
    )
    .bind(id)
    .bind(worker_id)
    .bind(error)
    .bind(retryable)
    .bind(max_attempts)
    .fetch_optional(db)
    .await
}

/// Requeues (or fails) every job whose worker stopped heartbeating.
/// Returns (id, new status) for each job it touched.
pub async fn reap_expired(db: &PgPool, max_attempts: i32) -> sqlx::Result<Vec<(Uuid, String)>> {
    sqlx::query_as(
        "UPDATE proof_requests
         SET status = CASE WHEN attempts < $1 THEN 'queued' ELSE 'failed' END,
             error = 'worker stopped responding (lease expired)',
             worker_id = NULL,
             lease_expires_at = NULL,
             updated_at = now()
         WHERE status IN ('assigned', 'proving') AND lease_expires_at < now()
         RETURNING id, status",
    )
    .bind(max_attempts)
    .fetch_all(db)
    .await
}
