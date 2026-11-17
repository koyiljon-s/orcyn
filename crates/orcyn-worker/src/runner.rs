//! Runs one claimed job from start to finish.
//!
//! ```text
//! download program + stdin → start → prove ─────────────→ submit | fail
//!                                    heartbeat every 10s ┘ (background task)
//! ```

use std::time::Duration;

use orcyn_types::{ClaimedJob, RequestId};
use tokio::sync::oneshot;
use tokio_util::sync::CancellationToken;
use tracing::Instrument;

use crate::api::{ApiClient, ApiError};
use crate::prover::{ProveError, Prover};

pub async fn run_job(
    api: &ApiClient,
    prover: &mut Prover,
    job: ClaimedJob,
    heartbeat_every: Duration,
    shutdown: &CancellationToken,
) {
    let id = job.request_id;
    // Every log line inside gets these fields. `.instrument` (not `span.enter()`)
    // is the async-safe way: the span follows the future across `.await`s.
    let span = tracing::info_span!("job", request_id = %id, mode = job.mode.as_str(), attempt = job.attempt);
    run_job_inner(api, prover, job, heartbeat_every, shutdown)
        .instrument(span)
        .await
}

async fn run_job_inner(
    api: &ApiClient,
    prover: &mut Prover,
    job: ClaimedJob,
    heartbeat_every: Duration,
    shutdown: &CancellationToken,
) {
    let id = job.request_id;
    match run(api, prover, &job, heartbeat_every, shutdown).await {
        Ok(Outcome::Submitted) => tracing::info!("proof submitted"),
        Ok(Outcome::Lost) => tracing::warn!("lost the job (lease expired); dropped it"),
        Ok(Outcome::Failed(err)) => report_failure(api, id, &err.message, err.retryable).await,
        Ok(Outcome::ShuttingDown) => {
            // Hand the job back right away instead of making the API wait
            // for the lease to expire.
            report_failure(api, id, "worker shutting down", true).await
        }
        Err(ApiError::LostJob) => tracing::warn!("lost the job; dropped it"),
        Err(ApiError::Other(err)) => {
            // Couldn't talk to the API. Try to report; if that fails too,
            // the lease will expire and the reaper requeues the job.
            tracing::error!(error = %err, "API error while working on job");
            report_failure(api, id, &format!("worker API error: {err}"), true).await
        }
    }
}

enum Outcome {
    Submitted,
    Lost,
    Failed(ProveError),
    ShuttingDown,
}

async fn run(
    api: &ApiClient,
    prover: &mut Prover,
    job: &ClaimedJob,
    heartbeat_every: Duration,
    shutdown: &CancellationToken,
) -> Result<Outcome, ApiError> {
    let id = job.request_id;

    let program = api.program(id).await?;
    let stdin = api.stdin(id).await?;
    api.start(id).await?;
    tracing::info!(program_bytes = program.len(), stdin_bytes = stdin.len(), "proving started");

    // Keep the lease alive while proving. The heartbeat runs as its own
    // task, so it keeps ticking even while the prover is busy. If the API
    // says we lost the job, it tells us through `lost_rx`.
    let (lost_tx, lost_rx) = oneshot::channel::<()>();
    let heartbeat = tokio::spawn(heartbeat_loop(api.clone(), id, heartbeat_every, lost_tx));

    // Wait for whichever happens first. The other branches are dropped:
    // if the job is lost or we're shutting down, we stop waiting for the proof.
    let outcome = tokio::select! {
        result = prover.prove(&job.program_hash, program, &stdin, job.mode) => match result {
            Ok(proof) => {
                api.submit(id, proof).await?;
                Outcome::Submitted
            }
            Err(err) => Outcome::Failed(err),
        },
        _ = lost_rx => Outcome::Lost,
        _ = shutdown.cancelled() => Outcome::ShuttingDown,
    };

    heartbeat.abort();
    Ok(outcome)
}

async fn heartbeat_loop(api: ApiClient, id: RequestId, every: Duration, lost: oneshot::Sender<()>) {
    let mut ticker = tokio::time::interval(every);
    ticker.tick().await; // the first tick fires immediately; `start` just renewed the lease

    loop {
        ticker.tick().await;
        match api.heartbeat(id).await {
            Ok(_) => tracing::debug!("heartbeat ok"),
            Err(ApiError::LostJob) => {
                let _ = lost.send(());
                return;
            }
            // A missed heartbeat isn't fatal: the lease (60s) outlasts
            // several of them. Keep trying.
            Err(ApiError::Other(err)) => tracing::warn!(error = %err, "heartbeat failed"),
        }
    }
}

async fn report_failure(api: &ApiClient, id: RequestId, error: &str, retryable: bool) {
    match api.fail(id, error, retryable).await {
        Ok(response) => tracing::warn!(
            %error,
            new_status = response.status.as_str(),
            "job failed"
        ),
        Err(err) => tracing::error!(%error, report_error = %err, "job failed; could not report it"),
    }
}
