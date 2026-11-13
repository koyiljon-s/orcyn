use std::time::Duration;

use anyhow::Context;
use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;

/// Connects to Postgres and applies pending migrations.
///
/// Used by both the server and `orcyn-admin`, so either works on a fresh database.
pub async fn connect(database_url: &str) -> anyhow::Result<PgPool> {
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(5))
        .connect(database_url)
        .await
        .context("failed to connect to Postgres")?;

    // Applies migrations in crates/orcyn-api/migrations/ that haven't run yet.
    // sqlx records applied ones in the `_sqlx_migrations` table.
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .context("failed to run database migrations")?;

    Ok(pool)
}
