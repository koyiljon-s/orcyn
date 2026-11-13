use axum::Json;
use serde::Serialize;
use uuid::Uuid;

use crate::auth::AuthedAccount;

#[derive(Serialize)]
pub struct MeResponse {
    account_id: Uuid,
    account_name: String,
}

/// GET /v1/me: who does this API key belong to?
///
/// Used by `orcyn login` to check a key before saving it.
/// Taking `AuthedAccount` as an argument is all it takes to require a key.
pub async fn me(account: AuthedAccount) -> Json<MeResponse> {
    Json(MeResponse {
        account_id: account.account_id,
        account_name: account.account_name,
    })
}
