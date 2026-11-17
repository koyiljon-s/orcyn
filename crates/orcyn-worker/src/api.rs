//! HTTP client for the worker protocol (see orcyn-api `routes/workers.rs`).

use std::time::Duration;

use orcyn_types::{
    ClaimedJob, FailJobRequest, FailJobResponse, HeartbeatResponse, RequestId, WORKER_ID_HEADER,
};
use reqwest::{RequestBuilder, Response, StatusCode};

/// Errors the job runner needs to tell apart.
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    /// 409: the API no longer considers this job ours (lease expired, or it
    /// was finished/requeued). Stop working on it; don't report anything.
    #[error("job is no longer held by this worker")]
    LostJob,

    /// Network problems, 5xx, unexpected responses. Usually temporary.
    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

impl From<reqwest::Error> for ApiError {
    fn from(err: reqwest::Error) -> Self {
        ApiError::Other(err.into())
    }
}

type Result<T> = std::result::Result<T, ApiError>;

/// Uploads/downloads (ELF, stdin, proof) can be large; everything else is quick.
const SHORT_TIMEOUT: Duration = Duration::from_secs(30);
const TRANSFER_TIMEOUT: Duration = Duration::from_secs(600);

#[derive(Clone)]
pub struct ApiClient {
    http: reqwest::Client,
    base_url: String,
    token: String,
    worker_id: String,
}

impl ApiClient {
    pub fn new(base_url: &str, token: &str, worker_id: &str) -> anyhow::Result<Self> {
        Ok(ApiClient {
            http: reqwest::Client::builder()
                .connect_timeout(Duration::from_secs(10))
                .build()?,
            base_url: base_url.trim_end_matches('/').to_string(),
            token: token.to_string(),
            worker_id: worker_id.to_string(),
        })
    }

    /// Builds a request with the worker auth headers already set.
    fn request(&self, method: reqwest::Method, path: &str) -> RequestBuilder {
        self.http
            .request(method, format!("{}{}", self.base_url, path))
            .bearer_auth(&self.token)
            .header(WORKER_ID_HEADER, &self.worker_id)
            .timeout(SHORT_TIMEOUT)
    }

    fn job_path(id: RequestId, action: &str) -> String {
        format!("/v1/workers/jobs/{id}/{action}")
    }

    /// `Some(job)` if one was assigned to us, `None` if the queue is empty.
    pub async fn claim(&self) -> Result<Option<ClaimedJob>> {
        let response = self
            .request(reqwest::Method::POST, "/v1/workers/claim")
            .send()
            .await?;
        if response.status() == StatusCode::NO_CONTENT {
            return Ok(None);
        }
        Ok(Some(check(response).await?.json().await?))
    }

    pub async fn program(&self, id: RequestId) -> Result<Vec<u8>> {
        self.download(&Self::job_path(id, "program")).await
    }

    pub async fn stdin(&self, id: RequestId) -> Result<Vec<u8>> {
        self.download(&Self::job_path(id, "stdin")).await
    }

    async fn download(&self, path: &str) -> Result<Vec<u8>> {
        let response = self
            .request(reqwest::Method::GET, path)
            .timeout(TRANSFER_TIMEOUT)
            .send()
            .await?;
        Ok(check(response).await?.bytes().await?.to_vec())
    }

    pub async fn start(&self, id: RequestId) -> Result<()> {
        let response = self
            .request(reqwest::Method::POST, &Self::job_path(id, "start"))
            .send()
            .await?;
        check(response).await?;
        Ok(())
    }

    pub async fn heartbeat(&self, id: RequestId) -> Result<HeartbeatResponse> {
        let response = self
            .request(reqwest::Method::POST, &Self::job_path(id, "heartbeat"))
            .send()
            .await?;
        Ok(check(response).await?.json().await?)
    }

    pub async fn submit(&self, id: RequestId, proof: Vec<u8>) -> Result<()> {
        let response = self
            .request(reqwest::Method::POST, &Self::job_path(id, "submit"))
            .timeout(TRANSFER_TIMEOUT)
            .header(reqwest::header::CONTENT_TYPE, "application/octet-stream")
            .body(proof)
            .send()
            .await?;
        check(response).await?;
        Ok(())
    }

    pub async fn fail(&self, id: RequestId, error: &str, retryable: bool) -> Result<FailJobResponse> {
        let response = self
            .request(reqwest::Method::POST, &Self::job_path(id, "fail"))
            .json(&FailJobRequest {
                error: error.to_string(),
                retryable,
            })
            .send()
            .await?;
        Ok(check(response).await?.json().await?)
    }
}

/// Turns non-2xx responses into errors. 409 becomes `LostJob`.
async fn check(response: Response) -> Result<Response> {
    let status = response.status();
    if status.is_success() {
        return Ok(response);
    }
    if status == StatusCode::CONFLICT {
        return Err(ApiError::LostJob);
    }
    let body = response.text().await.unwrap_or_default();
    Err(ApiError::Other(anyhow::anyhow!("orcyn-api returned {status}: {body}")))
}
