//! Finds jobs whose worker stopped heartbeating and puts them back in the queue.
//!
//! A worker can die at any moment (crash, out of memory, node deleted by the
//! autoscaler). It can't report its own death, so the API notices instead:
//! no heartbeat before `lease_expires_at` means the worker is gone.
//!
//! Safe with several API replicas: each UPDATE is atomic, so two reapers
//! can't requeue the same job twice.

use std::time::Duration;

use tokio::time::MissedTickBehavior;

use crate::repo;
use crate::state::AppState;

/// Starts the reaper loop on the Tokio runtime and returns immediately.
pub fn spawn(state: AppState) {
    let every = Duration::from_secs(state.config.reaper_interval_secs);

    // `tokio::spawn` runs this future concurrently with the server, like a
    // lightweight thread. It stops when the process exits.
    tokio::spawn(async move {
        let mut ticker = tokio::time::interval(every);
        // If a run is slow, don't fire several catch-up ticks back to back.
        ticker.set_missed_tick_behavior(MissedTickBehavior::Delay);

        loop {
            ticker.tick().await;
            match repo::queue::reap_expired(&state.db, state.config.max_attempts).await {
                Ok(reaped) => {
                    for (id, status) in reaped {
                        tracing::warn!(request_id = %id, new_status = %status, "lease expired");
                    }
                }
                // Keep looping: a DB blip shouldn't kill the reaper for good.
                Err(err) => tracing::error!(error = %err, "lease reaper failed"),
            }
        }
    });
}
