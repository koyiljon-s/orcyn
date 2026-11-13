use sqlx::PgPool;
use uuid::Uuid;

/// An active key joined with its account, as returned by `authenticate`.
#[derive(Debug, sqlx::FromRow)]
pub struct KeyOwnerRow {
    pub key_id: Uuid,
    pub account_id: Uuid,
    pub account_name: String,
}

pub async fn insert(
    db: &PgPool,
    account_id: Uuid,
    display_prefix: &str,
    key_hash: &[u8],
) -> sqlx::Result<Uuid> {
    sqlx::query_scalar(
        "INSERT INTO api_keys (account_id, prefix, key_hash)
         VALUES ($1, $2, $3)
         RETURNING id",
    )
    .bind(account_id)
    .bind(display_prefix)
    .bind(key_hash)
    .fetch_one(db)
    .await
}

/// Finds a non-revoked key by hash and records that it was used.
///
/// One round trip: the UPDATE both checks the key and stamps `last_used_at`,
/// and the CTE (`WITH ...`) joins the account name onto the result.
pub async fn authenticate(db: &PgPool, key_hash: &[u8]) -> sqlx::Result<Option<KeyOwnerRow>> {
    sqlx::query_as(
        "WITH key AS (
             UPDATE api_keys SET last_used_at = now()
             WHERE key_hash = $1 AND revoked_at IS NULL
             RETURNING id, account_id
         )
         SELECT key.id AS key_id, key.account_id, accounts.name AS account_name
         FROM key JOIN accounts ON accounts.id = key.account_id",
    )
    .bind(key_hash)
    .fetch_optional(db)
    .await
}
