use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::JobStatus;

/// Unique ID of a proof request.
///
/// A "newtype" wrapper around `Uuid`: the compiler won't let you pass a
/// `RequestId` where another kind of ID is expected, even though both are UUIDs.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(transparent)] // JSON: plain "550e8400-..." string, not {"0": "..."}
pub struct RequestId(pub Uuid);

impl RequestId {
    pub fn new() -> Self {
        RequestId(Uuid::new_v4())
    }
}

impl Default for RequestId {
    fn default() -> Self {
        Self::new()
    }
}

impl std::fmt::Display for RequestId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

/// What kind of SP1 proof to generate.
///
/// Ordered roughly from fastest/largest to slowest/smallest.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProofMode {
    /// Fastest; proof size grows with the program's execution length.
    Core,
    /// Constant-size STARK proof; can be verified inside other SP1 programs.
    Compressed,
    /// Tiny SNARK proof, cheap to verify on-chain (~270k gas).
    Groth16,
    /// SNARK proof with no trusted setup; slightly more expensive on-chain.
    Plonk,
}

/// A proof request as stored by the API and returned to clients.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ProofRequest {
    pub id: RequestId,
    pub mode: ProofMode,
    pub status: JobStatus,
    /// Worker currently holding the job, if any.
    pub worker_id: Option<String>,
    /// Human-readable reason when `status` is `Failed`.
    pub error: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_through_json() {
        let now = Utc::now();
        let original = ProofRequest {
            id: RequestId::new(),
            mode: ProofMode::Groth16,
            status: JobStatus::Queued,
            worker_id: None,
            error: None,
            created_at: now,
            updated_at: now,
        };

        let json = serde_json::to_string(&original).unwrap();
        let parsed: ProofRequest = serde_json::from_str(&json).unwrap();

        assert_eq!(original, parsed);
        assert!(json.contains("\"mode\":\"groth16\""));
    }
}
