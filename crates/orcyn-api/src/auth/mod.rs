//! Who is calling? Extractors that authenticate requests.

mod api_key;
mod worker;

pub use api_key::AuthedAccount;
pub use worker::AuthedWorker;

use axum::http::header::AUTHORIZATION;
use axum::http::request::Parts;

/// Returns `<token>` from an `Authorization: Bearer <token>` header.
fn bearer_token(parts: &Parts) -> Option<&str> {
    parts
        .headers
        .get(AUTHORIZATION)?
        .to_str()
        .ok()?
        .strip_prefix("Bearer ")
}
