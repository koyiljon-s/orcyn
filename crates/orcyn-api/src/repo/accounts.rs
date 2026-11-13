use sqlx::PgPool;
use uuid::Uuid;

/// Returns the id of the account with this name, creating it if needed.
pub async fn get_or_create(db: &PgPool, name: &str) -> sqlx::Result<Uuid> {
    // `DO NOTHING` would return no row when the account already exists,
    // so we do a no-op update to always get the id back.
    sqlx::query_scalar(
        "INSERT INTO accounts (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id",
    )
    .bind(name)
    .fetch_one(db)
    .await
}
