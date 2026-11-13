use serde::{Deserialize, Serialize};

/// Lifecycle of a proof request.
///
/// ```text
/// Queued → Assigned → Proving → Fulfilled
///    ▲        │          │
///    │        └──────────┴──→ Failed
///    └──────── retry ─────────┘
/// ```
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")] // JSON: "queued", "assigned", ...
pub enum JobStatus {
    /// Waiting for a worker to claim it.
    Queued,
    /// A worker claimed it but hasn't started proving yet.
    Assigned,
    /// A worker is generating the proof.
    Proving,
    /// Proof is done and stored. Final state.
    Fulfilled,
    /// Proving failed. Can be retried (goes back to `Queued`).
    Failed,
}

impl JobStatus {
    /// Returns true if the job will never change again.
    pub fn is_terminal(self) -> bool {
        matches!(self, JobStatus::Fulfilled)
    }

    /// Returns true if moving from `self` to `next` is allowed.
    pub fn can_transition_to(self, next: JobStatus) -> bool {
        use JobStatus::*;
        matches!(
            (self, next),
            (Queued, Assigned)
                | (Assigned, Proving)
                | (Assigned, Queued) // worker lease expired before proving started
                | (Proving, Fulfilled)
                | (Proving, Failed)
                | (Proving, Queued) // worker lease expired during proving
                | (Failed, Queued) // retry
        )
    }
}

// Unit tests live next to the code. Run with `cargo test`.
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn happy_path_is_allowed() {
        assert!(JobStatus::Queued.can_transition_to(JobStatus::Assigned));
        assert!(JobStatus::Assigned.can_transition_to(JobStatus::Proving));
        assert!(JobStatus::Proving.can_transition_to(JobStatus::Fulfilled));
    }

    #[test]
    fn fulfilled_is_final() {
        assert!(JobStatus::Fulfilled.is_terminal());
        assert!(!JobStatus::Fulfilled.can_transition_to(JobStatus::Queued));
    }

    #[test]
    fn cannot_skip_states() {
        assert!(!JobStatus::Queued.can_transition_to(JobStatus::Fulfilled));
    }

    #[test]
    fn serializes_as_snake_case() {
        let json = serde_json::to_string(&JobStatus::Proving).unwrap();
        assert_eq!(json, "\"proving\"");
    }
}
