use axum::Json;
use axum::extract::multipart::MultipartError;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

/// Every error a handler can return.
///
/// Handlers return `Result<T, ApiError>`, and `?` converts errors into this
/// type. `IntoResponse` below turns it into an HTTP status + JSON body.
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    /// The client sent something invalid. The message is shown to the client.
    #[error("{0}")]
    BadRequest(String),

    /// Missing, malformed, unknown or revoked API key. Returned as 401.
    /// Deliberately vague: we don't tell attackers *why* a key was rejected.
    #[error("invalid or missing API key")]
    Unauthorized,

    /// Doesn't exist, or belongs to another account (we don't reveal which).
    #[error("not found")]
    NotFound,

    /// The request is valid but the resource is in the wrong state, e.g. a
    /// worker reporting on a job it no longer holds, or a proof not ready yet.
    #[error("{0}")]
    Conflict(String),

    #[error("upload too large")]
    PayloadTooLarge,

    /// A dependency (e.g. the database) is down. Returned as 503.
    #[error("service unavailable: {0}")]
    Unavailable(&'static str),

    /// Any database error. `#[from]` lets `?` convert `sqlx::Error` automatically.
    #[error("database error")]
    Database(#[from] sqlx::Error),

    /// Anything else that went wrong on our side (storage, bad data, ...).
    #[error("internal error")]
    Internal(#[from] anyhow::Error),
}

/// Lets `?` work on multipart reads inside handlers.
impl From<MultipartError> for ApiError {
    fn from(err: MultipartError) -> Self {
        if err.status() == StatusCode::PAYLOAD_TOO_LARGE {
            ApiError::PayloadTooLarge
        } else {
            ApiError::BadRequest(err.body_text())
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, code) = match &self {
            ApiError::BadRequest(_) => (StatusCode::BAD_REQUEST, "bad_request"),
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized"),
            ApiError::NotFound => (StatusCode::NOT_FOUND, "not_found"),
            ApiError::Conflict(_) => (StatusCode::CONFLICT, "conflict"),
            ApiError::PayloadTooLarge => (StatusCode::PAYLOAD_TOO_LARGE, "payload_too_large"),
            ApiError::Unavailable(_) => (StatusCode::SERVICE_UNAVAILABLE, "unavailable"),
            ApiError::Database(_) | ApiError::Internal(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "internal")
            }
        };

        // Log full details server-side; never send internal errors to clients.
        if status.is_server_error() {
            tracing::error!(error = ?self, "request failed");
        }

        let body = Json(json!({
            "error": { "code": code, "message": self.to_string() }
        }));
        (status, body).into_response()
    }
}
