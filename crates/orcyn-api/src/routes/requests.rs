use axum::Json;
use axum::extract::{Multipart, Path, Query, State};
use axum::http::{StatusCode, header};
use axum::response::IntoResponse;
use orcyn_types::{ProofMode, ProofRequest};
use serde::Deserialize;
use uuid::Uuid;

use crate::auth::AuthedAccount;
use crate::error::ApiError;
use crate::services;
use crate::state::AppState;

/// POST /v1/requests (multipart/form-data)
///
/// Fields:
/// - `mode`:    core | compressed | groth16 | plonk
/// - `program`: the SP1 program ELF (file)
/// - `stdin`:   serialized SP1 stdin (file, optional)
///
/// ```text
/// curl -H "Authorization: Bearer $ORCYN_KEY" \
///      -F mode=groth16 -F program=@fibonacci.elf -F stdin=@input.bin \
///      localhost:8080/v1/requests
/// ```
///
/// `Multipart` reads the request body, so it must be the last argument.
/// `AuthedAccount` runs first, so unauthenticated uploads are rejected
/// before the body is read.
pub async fn create(
    State(state): State<AppState>,
    account: AuthedAccount,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<ProofRequest>), ApiError> {
    let mut mode: Option<ProofMode> = None;
    let mut program = None;
    let mut stdin = None;

    while let Some(field) = multipart.next_field().await? {
        let name = field.name().unwrap_or_default().to_string();
        match name.as_str() {
            "mode" => {
                let text = field.text().await?;
                mode = Some(text.parse().map_err(|e| ApiError::BadRequest(format!("{e}")))?);
            }
            "program" => program = Some(field.bytes().await?),
            "stdin" => stdin = Some(field.bytes().await?),
            other => {
                return Err(ApiError::BadRequest(format!("unexpected field '{other}'")));
            }
        }
    }

    let mode = mode.ok_or_else(|| ApiError::BadRequest("missing field 'mode'".into()))?;
    let program = program.ok_or_else(|| ApiError::BadRequest("missing field 'program'".into()))?;
    let stdin = stdin.unwrap_or_default();

    let request =
        services::requests::create(&state, account.account_id, mode, &program, &stdin).await?;

    Ok((StatusCode::CREATED, Json(request)))
}

/// GET /v1/requests/{id}
pub async fn get(
    State(state): State<AppState>,
    account: AuthedAccount,
    Path(id): Path<Uuid>,
) -> Result<Json<ProofRequest>, ApiError> {
    let request = services::requests::get(&state, account.account_id, id).await?;
    Ok(Json(request))
}

/// GET /v1/requests/{id}/proof: download the finished proof (binary).
pub async fn proof(
    State(state): State<AppState>,
    account: AuthedAccount,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, ApiError> {
    let bytes = services::requests::proof(&state, account.account_id, id).await?;
    let headers = [
        (header::CONTENT_TYPE, "application/octet-stream".to_string()),
        (
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{id}.proof\""),
        ),
    ];
    Ok((headers, bytes))
}

#[derive(Deserialize)]
pub struct ListParams {
    limit: Option<i64>,
}

/// GET /v1/requests?limit=20
pub async fn list(
    State(state): State<AppState>,
    account: AuthedAccount,
    Query(params): Query<ListParams>,
) -> Result<Json<Vec<ProofRequest>>, ApiError> {
    let requests = services::requests::list(&state, account.account_id, params.limit).await?;
    Ok(Json(requests))
}
