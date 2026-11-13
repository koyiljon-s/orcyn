//! Shared data types for the Orcyn prover network.
//!
//! Every service (api, worker, sdk, cli) depends on this crate so they all
//! agree on the shape of the data sent between them.

mod job;
mod parse;
mod request;

// Re-export so users write `orcyn_types::JobStatus`
// instead of `orcyn_types::job::JobStatus`.
pub use job::JobStatus;
pub use parse::ParseEnumError;
pub use request::{ProofMode, ProofRequest, RequestId};
