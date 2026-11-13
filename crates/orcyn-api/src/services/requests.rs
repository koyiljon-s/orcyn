//! Proof request rules: validation, storage layout, ownership.

use orcyn_types::{JobStatus, ProofMode, ProofRequest, RequestId};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::error::ApiError;
use crate::repo::proof_requests::{self, NewProofRequest};
use crate::state::AppState;

/// Every ELF file starts with these 4 bytes.
const ELF_MAGIC: &[u8] = b"\x7fELF";

pub const DEFAULT_LIST_LIMIT: i64 = 20;
pub const MAX_LIST_LIMIT: i64 = 100;

pub async fn create(
    state: &AppState,
    account_id: Uuid,
    mode: ProofMode,
    elf: &[u8],
    stdin: &[u8],
) -> Result<ProofRequest, ApiError> {
    if !elf.starts_with(ELF_MAGIC) {
        return Err(ApiError::BadRequest(
            "program is not an ELF file (build it with `cargo prove build`)".into(),
        ));
    }

    let id = RequestId::new();
    let program_hash = hex::encode(Sha256::digest(elf));

    // Content-addressed: the same program is stored once, however many requests use it.
    let elf_key = format!("elfs/{program_hash}");
    let stdin_key = format!("stdin/{id}");

    // Files first, then the DB row. If the insert fails we leave an unused
    // file behind (harmless). The reverse order could leave a row pointing
    // at a file that doesn't exist.
    state.storage.put(&elf_key, elf).await?;
    state.storage.put(&stdin_key, stdin).await?;

    let row = proof_requests::insert(
        &state.db,
        NewProofRequest {
            id,
            account_id,
            mode,
            program_hash: &program_hash,
            elf_key: &elf_key,
            stdin_key: &stdin_key,
        },
    )
    .await?;

    tracing::info!(request_id = %id, %account_id, mode = mode.as_str(), "proof request created");
    Ok(row.try_into()?)
}

pub async fn get(state: &AppState, account_id: Uuid, id: Uuid) -> Result<ProofRequest, ApiError> {
    let row = proof_requests::find_for_account(&state.db, id, account_id)
        .await?
        .ok_or(ApiError::NotFound)?;
    Ok(row.try_into()?)
}

/// The finished proof bytes. 409 if the request isn't fulfilled yet.
pub async fn proof(state: &AppState, account_id: Uuid, id: Uuid) -> Result<Vec<u8>, ApiError> {
    let (status, proof_key) = proof_requests::proof_key_for_account(&state.db, id, account_id)
        .await?
        .ok_or(ApiError::NotFound)?;

    if status != JobStatus::Fulfilled.as_str() {
        return Err(ApiError::Conflict(format!("proof not ready (status: {status})")));
    }
    let proof_key = proof_key
        .ok_or_else(|| anyhow::anyhow!("fulfilled request {id} has no proof_key"))?;

    Ok(state.storage.get(&proof_key).await?)
}

pub async fn list(
    state: &AppState,
    account_id: Uuid,
    limit: Option<i64>,
) -> Result<Vec<ProofRequest>, ApiError> {
    let limit = limit.unwrap_or(DEFAULT_LIST_LIMIT).clamp(1, MAX_LIST_LIMIT);
    let rows = proof_requests::list_for_account(&state.db, account_id, limit).await?;

    // Convert every row; stop at the first failure.
    let requests = rows
        .into_iter()
        .map(ProofRequest::try_from)
        .collect::<anyhow::Result<Vec<_>>>()?;
    Ok(requests)
}
