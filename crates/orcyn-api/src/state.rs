use std::sync::Arc;

use sqlx::PgPool;

use crate::config::Config;
use crate::storage::ArtifactStore;

/// Shared state handed to every request handler.
///
/// `Clone` is cheap: `PgPool` is internally reference-counted, and `Arc`
/// ("atomically reference-counted") shares one `Config` instead of copying it.
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub storage: ArtifactStore,
    pub config: Arc<Config>,
}
