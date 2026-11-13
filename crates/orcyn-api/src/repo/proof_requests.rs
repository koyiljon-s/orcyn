use anyhow::Context;
use chrono::{DateTime, Utc};
use orcyn_types::{ProofMode, ProofRequest, RequestId};
use sqlx::PgPool;
use uuid::Uuid;

/// Columns of `proof_requests` that clients may see, plus `account_id`.
/// Storage keys and coordinator fields stay private to the API.
#[derive(Debug, sqlx::FromRow)]
pub struct ProofRequestRow {
    pub id: Uuid,
    pub mode: String,
    pub status: String,
    pub program_hash: String,
    pub worker_id: Option<String>,
    pub error: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Columns selected for `ProofRequestRow`. Kept in one place so every query
/// returns the same shape.
///
/// A macro, not a `const`: sqlx 0.9 only accepts SQL known at compile time
/// (`&'static str`) to rule out SQL injection, and `concat!` can only join
/// literals, which a macro expands to.
macro_rules! columns {
    () => {
        "id, mode, status, program_hash, worker_id, error, created_at, updated_at"
    };
}

/// Row → public type. Fails only if the DB holds a value the code doesn't
/// know, which the CHECK constraints prevent.
impl TryFrom<ProofRequestRow> for ProofRequest {
    type Error = anyhow::Error;

    fn try_from(row: ProofRequestRow) -> anyhow::Result<Self> {
        Ok(ProofRequest {
            id: RequestId(row.id),
            mode: row.mode.parse().context("invalid mode in database")?,
            status: row.status.parse().context("invalid status in database")?,
            program_hash: row.program_hash,
            worker_id: row.worker_id,
            error: row.error,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}

pub struct NewProofRequest<'a> {
    pub id: RequestId,
    pub account_id: Uuid,
    pub mode: ProofMode,
    pub program_hash: &'a str,
    pub elf_key: &'a str,
    pub stdin_key: &'a str,
}

pub async fn insert(db: &PgPool, new: NewProofRequest<'_>) -> sqlx::Result<ProofRequestRow> {
    sqlx::query_as(concat!(
        "INSERT INTO proof_requests (id, account_id, mode, program_hash, elf_key, stdin_key)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ",
        columns!()
    ))
    .bind(new.id.0)
    .bind(new.account_id)
    .bind(new.mode.as_str())
    .bind(new.program_hash)
    .bind(new.elf_key)
    .bind(new.stdin_key)
    .fetch_one(db)
    .await
}

/// Only returns the request if it belongs to `account_id`.
pub async fn find_for_account(
    db: &PgPool,
    id: Uuid,
    account_id: Uuid,
) -> sqlx::Result<Option<ProofRequestRow>> {
    sqlx::query_as(concat!(
        "SELECT ",
        columns!(),
        " FROM proof_requests WHERE id = $1 AND account_id = $2"
    ))
    .bind(id)
    .bind(account_id)
    .fetch_optional(db)
    .await
}

/// Newest first.
pub async fn list_for_account(
    db: &PgPool,
    account_id: Uuid,
    limit: i64,
) -> sqlx::Result<Vec<ProofRequestRow>> {
    sqlx::query_as(concat!(
        "SELECT ",
        columns!(),
        " FROM proof_requests
         WHERE account_id = $1
         ORDER BY created_at DESC
         LIMIT $2"
    ))
    .bind(account_id)
    .bind(limit)
    .fetch_all(db)
    .await
}
