use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use orcyn_types::WORKER_ID_HEADER;
use sha2::{Digest, Sha256};

use super::bearer_token;
use crate::error::ApiError;
use crate::state::AppState;

/// A worker that presented the shared worker token.
///
/// Phase 1: one shared secret for all workers (a Kubernetes Secret).
/// Later: Kubernetes service account tokens, one identity per pod.
#[derive(Debug, Clone)]
pub struct AuthedWorker {
    /// From the `X-Orcyn-Worker-Id` header, e.g. "gpu-worker-1".
    pub worker_id: String,
}

impl FromRequestParts<AppState> for AuthedWorker {
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, ApiError> {
        let expected = state
            .config
            .worker_token
            .as_deref()
            .ok_or(ApiError::Unauthorized)?; // worker endpoints disabled

        let token = bearer_token(parts).ok_or(ApiError::Unauthorized)?;
        if !constant_time_eq(token, expected) {
            return Err(ApiError::Unauthorized);
        }

        let worker_id = parts
            .headers
            .get(WORKER_ID_HEADER)
            .and_then(|value| value.to_str().ok())
            .filter(|id| is_valid_worker_id(id))
            .ok_or_else(|| {
                ApiError::BadRequest(format!(
                    "missing or invalid {WORKER_ID_HEADER} header (1-64 chars: letters, digits, '-', '_', '.')"
                ))
            })?;

        Ok(AuthedWorker {
            worker_id: worker_id.to_string(),
        })
    }
}

/// Compares secrets without leaking *where* they differ through timing.
///
/// A normal `==` stops at the first different byte, so an attacker measuring
/// response times could guess a token byte by byte. Hashing gives both sides
/// the same length, and the fold always looks at every byte.
fn constant_time_eq(a: &str, b: &str) -> bool {
    let (a, b) = (Sha256::digest(a), Sha256::digest(b));
    a.iter().zip(b.iter()).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

fn is_valid_worker_id(id: &str) -> bool {
    (1..=64).contains(&id.len())
        && id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.'))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compares_tokens() {
        assert!(constant_time_eq("secret", "secret"));
        assert!(!constant_time_eq("secret", "secreT"));
        assert!(!constant_time_eq("secret", "secret-longer"));
    }

    #[test]
    fn validates_worker_ids() {
        assert!(is_valid_worker_id("gpu-worker-1"));
        assert!(is_valid_worker_id("orcyn-worker-7d9f.abc_1"));
        assert!(!is_valid_worker_id(""));
        assert!(!is_valid_worker_id("has space"));
        assert!(!is_valid_worker_id(&"a".repeat(65)));
    }
}
