use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

/// Every error a handler can return.
///
/// Handlers return `Result<T, ApiError>`, and `?` converts errors into this
/// type. `IntoResponse` below turns it into an HTTP status + JSON body.
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    /// A dependency (e.g. the database) is down. Returned as 503.
    #[error("service unavailable: {0}")]
    Unavailable(&'static str),

    /// Any database error. `#[from]` lets `?` convert `sqlx::Error` automatically.
    #[error("database error")]
    Database(#[from] sqlx::Error),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, code) = match &self {
            ApiError::Unavailable(_) => (StatusCode::SERVICE_UNAVAILABLE, "unavailable"),
            ApiError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "internal"),
        };

        // Log full details server-side; never send raw DB errors to clients.
        if status.is_server_error() {
            tracing::error!(error = ?self, "request failed");
        }

        let body = Json(json!({
            "error": { "code": code, "message": self.to_string() }
        }));
        (status, body).into_response()
    }
}
