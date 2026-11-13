use sqlx::PgPool;

use crate::storage::ArtifactStore;

/// Shared state handed to every request handler.
///
/// `Clone` is cheap: `PgPool` is internally reference-counted, so cloning
/// gives another handle to the same pool, not a new set of connections.
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub storage: ArtifactStore,
}
