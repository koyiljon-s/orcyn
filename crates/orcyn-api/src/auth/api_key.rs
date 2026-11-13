use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use uuid::Uuid;

use super::bearer_token;
use crate::error::ApiError;
use crate::repo;
use crate::services::keys;
use crate::state::AppState;

/// The account behind a valid API key.
///
/// Put it in a handler's arguments to require authentication:
///
/// ```ignore
/// async fn handler(account: AuthedAccount) -> ... { account.account_id ... }
/// ```
///
/// Axum runs `from_request_parts` before the handler. If it returns an error,
/// the handler never runs and the client gets 401.
#[derive(Debug, Clone)]
pub struct AuthedAccount {
    pub account_id: Uuid,
    pub account_name: String,
    pub key_id: Uuid,
}

impl FromRequestParts<AppState> for AuthedAccount {
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, ApiError> {
        // Expect: Authorization: Bearer orcyn_sk_...
        let key = bearer_token(parts)
            .filter(|key| keys::looks_valid(key))
            .ok_or(ApiError::Unauthorized)?;

        let owner = repo::api_keys::authenticate(&state.db, &keys::hash(key))
            .await?
            .ok_or(ApiError::Unauthorized)?;

        Ok(AuthedAccount {
            account_id: owner.account_id,
            account_name: owner.account_name,
            key_id: owner.key_id,
        })
    }
}
