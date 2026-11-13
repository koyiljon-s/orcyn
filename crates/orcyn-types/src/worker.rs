//! Messages between orcyn-worker and orcyn-api (the worker protocol).

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{JobStatus, ProofMode, RequestId};

/// Header that identifies which worker is calling, e.g. "gpu-worker-1".
pub const WORKER_ID_HEADER: &str = "x-orcyn-worker-id";

/// Response to `POST /v1/workers/claim` when a job was assigned.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ClaimedJob {
    pub request_id: RequestId,
    pub mode: ProofMode,
    /// SHA-256 of the ELF. Workers can cache programs by this hash.
    pub program_hash: String,
    /// 1 on the first try, 2 on the first retry, ...
    pub attempt: i32,
    /// Send a heartbeat before this time or the job is given to another worker.
    pub lease_expires_at: DateTime<Utc>,
}

/// Response to `POST /v1/workers/jobs/{id}/heartbeat`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct HeartbeatResponse {
    pub lease_expires_at: DateTime<Utc>,
}

/// Body of `POST /v1/workers/jobs/{id}/fail`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FailJobRequest {
    pub error: String,
    /// `true`: something temporary (out of memory, crash), try again.
    /// `false`: retrying won't help (e.g. the program panics), fail for good.
    #[serde(default = "default_retryable")]
    pub retryable: bool,
}

fn default_retryable() -> bool {
    true
}

/// Response to `POST /v1/workers/jobs/{id}/fail`: what happened to the job.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FailJobResponse {
    /// `Queued` if it will be retried, `Failed` if not.
    pub status: JobStatus,
}
