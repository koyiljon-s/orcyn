use std::str::FromStr;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{JobStatus, ParseEnumError};

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

impl ProofMode {
    pub const ALL: [&'static str; 4] = ["core", "compressed", "groth16", "plonk"];

    /// The string stored in the database. Matches the JSON (serde) name.
    pub fn as_str(self) -> &'static str {
        match self {
            ProofMode::Core => "core",
            ProofMode::Compressed => "compressed",
            ProofMode::Groth16 => "groth16",
            ProofMode::Plonk => "plonk",
        }
    }
}

/// Enables `"groth16".parse::<ProofMode>()`.
impl FromStr for ProofMode {
    type Err = ParseEnumError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "core" => ProofMode::Core,
            "compressed" => ProofMode::Compressed,
            "groth16" => ProofMode::Groth16,
            "plonk" => ProofMode::Plonk,
            _ => {
                return Err(ParseEnumError {
                    kind: "proof mode",
                    value: s.to_string(),
                    expected: &ProofMode::ALL,
                });
            }
        })
    }
}

/// A proof request as stored by the API and returned to clients.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ProofRequest {
    pub id: RequestId,
    pub mode: ProofMode,
    pub status: JobStatus,
    /// SHA-256 of the program ELF (hex). Identical programs share a hash.
    pub program_hash: String,
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
    fn mode_as_str_matches_json_and_parses_back() {
        for name in ProofMode::ALL {
            let mode: ProofMode = name.parse().unwrap();
            assert_eq!(mode.as_str(), name);
            assert_eq!(serde_json::to_string(&mode).unwrap(), format!("\"{name}\""));
        }
        let err = "groth17".parse::<ProofMode>().unwrap_err();
        assert!(err.to_string().contains("groth16"));
    }

    #[test]
    fn round_trips_through_json() {
        let now = Utc::now();
        let original = ProofRequest {
            id: RequestId::new(),
            mode: ProofMode::Groth16,
            status: JobStatus::Queued,
            program_hash: "ab".repeat(32),
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
