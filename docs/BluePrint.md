# Orcyn Blueprint

Orcyn is a zero-knowledge prover network for SP1 programs, inspired by the Succinct Prover Network.
Users submit an SP1 program (ELF) plus input, and the network returns a verifiable proof.

---

## 1. Strategy

| Phase | Scope | Goal |
|---|---|---|
| **Phase 1: Private network (demo, ~1 month)** | Orcyn operates all provers (workers) itself: core services on GKE, GPU workers on RunPod. No "prover" user type. | Show the core value: *submit program → get verified ZK proof* |
| **Phase 2: Production service** | Billing, quotas, OAuth login, observability, multi-region | Real users |
| **Phase 3: Open network** | External provers, staking, bidding/assignment, slashing, on-chain settlement, explorer | Decentralized marketplace |

**Key rule for Phase 1:** workers talk to the API only through a clean HTTP protocol
(`claim` / `heartbeat` / `submit`) and never touch the database directly. A worker can therefore
run anywhere with HTTPS access to the API: on GKE, on RunPod, or (Phase 3) on someone else's
hardware. An external prover is just a worker run by someone else, plus staking and verification,
so no rewrite is needed.

---

## 2. Decisions

- **Language:** Rust (Cargo workspace)
- **Proving stack:** SP1 **6.10.0** (`sp1-sdk`), mock / CPU / CUDA provers. Details in [§5](#5-proving-with-sp1).
- **Cloud: hybrid**
  - **GCP (GKE)** for the core: API, database, CPU workers, ingress/TLS, artifact storage
  - **RunPod (Secure Cloud)** for GPU workers: no quota approval needed, 48 GB GPUs available
  - Why: GCP denied the first GPU quota request (new billing account, 2026-11-17). See [§4](#4-deployment)
- **Orchestration:** GKE (Kubernetes) + Helm for the core. RunPod pods are managed with Terraform, outside Kubernetes.
- **Infrastructure as code:** Terraform with two providers: `google` and `runpod`
- **Database:** PostgreSQL via **CloudNativePG** on GKE (backups to GCS). It is also the job queue (`FOR UPDATE SKIP LOCKED`). Local dev uses `deploy/local/docker-compose.yml`.
- **Artifacts:** GCS bucket (ELF, stdin, proofs) on GKE; local disk in development
- **Redis:** not used in Phase 1; add only if needed
- **Interface:** CLI-first (`orcyn`), backed by a Rust SDK. Web dashboard is deferred.
- **Auth:** opaque API keys for users (Phase 1: created by an admin command; Phase 2: issued after GitHub device-flow login). Workers use a shared token. See [§8](#8-authentication).
- **Frontend:** not required for auth. GitHub hosts the device-flow approval page. A dashboard is optional.
- **Domain:** `orcyn.xyz`

### Subdomains

| Subdomain | Purpose |
|---|---|
| `orcyn.xyz` | Landing page (`web/`) + `install.sh` |
| `api.orcyn.xyz` | Prove API (used by CLI/SDK **and by RunPod workers**) |
| `app.orcyn.xyz` | Optional dashboard (later, only if users ask) |
| `docs.orcyn.xyz` | Documentation (later) |
| `rpc.orcyn.xyz` | External prover endpoint (Phase 3) |
| `explorer.orcyn.xyz` | Public proof request explorer (Phase 3) |

---

## 3. Repository Structure

```
orcyn/
├── Cargo.toml                  # Rust workspace root (excludes programs/)
├── crates/
│   ├── orcyn-types/            # Shared types: ProofRequest, JobStatus, ProofMode, worker protocol
│   ├── orcyn-api/              # Axum server + orcyn-admin binary
│   │   ├── .env.example
│   │   ├── migrations/         # SQL migrations (sqlx), run on startup
│   │   └── src/
│   │       ├── main.rs, lib.rs, config.rs, state.rs, error.rs, db.rs, storage.rs
│   │       ├── auth/           # AuthedAccount (API key), AuthedWorker (worker token)
│   │       ├── routes/         # /health, /ready, /v1/me, /v1/requests, /v1/workers/*
│   │       ├── services/       # keys, requests, queue (business rules)
│   │       ├── repo/           # Postgres queries
│   │       ├── tasks/          # lease_reaper (background task)
│   │       └── bin/admin.rs    # orcyn-admin create-key
│   ├── orcyn-worker/           # Claims jobs, proves with SP1 (mock|cpu|cuda), submits proofs
│   │   ├── .env.example
│   │   └── src/                # main, config, api (client), prover (sp1), runner (one job)
│   ├── orcyn-sdk/              # Rust client library used by users & CLI (next)
│   └── orcyn-cli/              # `orcyn` binary: login, prove, status, download (next)
├── programs/
│   └── fibonacci/              # SP1 template: lib/, program/ (guest), script/ (host + stdin tool)
├── deploy/
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   └── worker.Dockerfile   # one Dockerfile; CPU build for GKE, CUDA build for RunPod/GPU
│   ├── helm/orcyn/             # api, cpu worker, ingress, config, secrets
│   └── local/
│       └── docker-compose.yml  # Postgres for local dev (host port 5433)
├── infra/terraform/            # GCP (VPC, GKE, GCS, DNS, IAM) + RunPod (GPU worker pod)
├── .github/workflows/          # CI: test, build images, cargo-dist releases
├── docs/
└── web/                        # Landing page (later)
```

---

## 4. Deployment

```
                         orcyn.xyz (Cloud DNS)
                                │
   orcyn CLI / SDK ──HTTPS──▶  api.orcyn.xyz  ◀──────────────── HTTPS (worker token) ───┐
                                │  GKE Ingress + managed TLS cert                       │
┌───────────────────────────────┼──────────── GKE cluster (GCP) ────────┐   ┌───── RunPod (Secure Cloud) ─────┐
│                               ▼                                       │   │                                  │
│   ┌──────────────┐   default node pool (e2-standard-4)                │   │  ┌────────────────────────────┐ │
│   │  orcyn-api   │   Deployment ×2                                    │   │  │ orcyn-worker --prover cuda │ │
│   └──────┬───────┘                                                    │   │  │ + sp1-gpu-server (child    │ │
│          │ claim / heartbeat / submit                                 │   │  │   process, no Docker)      │ │
│          ▼                                                            │   │  │ GPU: A6000 / L40S (48 GB)  │ │
│   ┌──────────────┐   cpu node pool (n2-highmem-8)                     │   │  └────────────────────────────┘ │
│   │ worker-cpu   │   real CPU proofs; demo fallback                   │   │  started/stopped with Terraform │
│   └──────────────┘                                                    │   │  (later: autoscaler in GKE)     │
│                                                                       │   └──────────────────────────────────┘
│   Postgres (CloudNativePG) ── backups ──┐                             │
└─────────────────────────────────────────┼─────────────────────────────┘
                                          ▼
                       GCS bucket: elfs/ stdin/ proofs/ backups/
                       (accessed via Workload Identity)
```

### How Kubernetes and RunPod fit together

- **Kubernetes manages the core:** API, database, CPU workers, ingress, TLS, secrets. This is where the Kubernetes learning happens (Deployments, Services, Ingress, probes, Secrets, Helm).
- **RunPod is an external worker pool.** A RunPod pod is a container on someone else's machine, not a machine, so it cannot join the GKE cluster as a node. The GPU worker connects to `api.orcyn.xyz` over HTTPS like any client.
- **Same Docker image everywhere.** The worker on RunPod is the same image as the CPU worker on GKE, built with the `cuda` feature and started with `--prover cuda`.
- **Terraform creates both** (google + runpod providers).
- **Later:** a small autoscaler in GKE (CronJob or controller) starts and stops RunPod pods through the RunPod API based on queue depth. Not needed for the demo.
- **If GCP GPU quota is granted later**, GPU workers can move into GKE as a GPU node pool (`g2-standard-8` + NVIDIA L4) with `nvidia.com/gpu: 1` in the Deployment. No code changes.

### Notes

- **RunPod Secure Cloud, not Community Cloud:** Community machines are run by third-party hosts who could see container data (user programs, inputs, the worker token).
- **Cost:** a 48 GB GPU is roughly $0.5–1/hour. Stop the pod when idle (~$20–50 for the demo month).
- **GCP GPU quota:** the first request was denied (2026-11-17: new billing account). Resubmit after 48 h with `GPUS_ALL_REGIONS=1` and `NVIDIA L4 GPUs=1`; also contact sales / the Google for Startups Cloud Program.
- **Spot GPUs (later, on GKE):** fit the design well. Preemption sends SIGTERM → the worker requeues the job immediately; a node vanishing without notice → the lease expires and the reaper requeues it. Use a non-Spot GPU for the live demo.
- **Workload Identity** gives GKE pods access to GCS without key files.

---

## 5. Proving with SP1

Verified against the `sp1-sdk` / `sp1-cuda` **6.10.0** source (the public docs are partly outdated).

| Topic | Fact |
|---|---|
| Version | `sp1-sdk = "6.10.0"`, needs Rust ≥ 1.91.1. Toolchain installed with `sp1up` |
| Provers | `EnvProver::{Mock, Cpu, Cuda}` built directly from the worker's `--prover` flag |
| CUDA | Spawns a **native** `~/.sp1/bin/sp1-gpu-server` child process (Unix socket `/tmp/sp1-cuda-N.sock`). **No Docker.** Auto-downloaded from SP1's GitHub releases; **Linux x86_64 only**. Bake it into the GPU image |
| Groth16 / Plonk | `native-gnark` feature: gnark runs in-process. Needs **Go at build time**. No Docker |
| Mock | `MockProver`: executes the program, returns a fake proof instantly. Used for local development |
| stdin format | bincode-serialized `SP1Stdin` (`programs/fibonacci/script/src/bin/stdin.rs` writes one) |
| Proof format | bincode-serialized `SP1ProofWithPublicValues` (same as `proof.save(path)`) |

### Worker pipeline (per job)

```
download ELF + stdin → start → execute (catch panics, count cycles)
  → setup (proving key, cached per program_hash) → prove (core|compressed|groth16|plonk)
  → verify own proof → submit
heartbeat every 10s runs alongside as a separate task
```

- **Permanent failures** (bad stdin, invalid ELF, program panics) skip retries.
- **Retryable failures** (proving errors after a successful execution: memory, GPU) go back to the queue until max attempts.

### Measured

| Where | Program | Mode | Result |
|---|---|---|---|
| MacBook (CPU) | fibonacci n=20, 9,596 cycles | core | execute 9 ms, setup 1.9 s, **prove 21 s**, proof 2.7 MB, ~2 GB peak RAM |
| AWS VM (strong CPU) | fibonacci | — | worked (user test, before this blueprint) |
| GPU | — | — | **not tested yet** (RunPod next) |

### Open risk: GPU memory for Groth16/Plonk

SP1's hardware page lists **24 GB** GPU memory for core/compressed but **40 GB+ for shrink/wrap** (needed by Groth16/Plonk). Plan: test on a 48 GB RunPod GPU (A6000 / L40S). Fallbacks: compressed on GPU then wrap on CPU, an 80 GB GPU, or demo with `compressed`.

### Gotcha

The SP1 project template's `Cargo.lock` pinned `tempfile 3.19.1`, but `sp1-prover 6.10.0` calls `TempDir::keep()` (newer tempfile). Fix: `cargo update -p tempfile`.

---

## 6. Proof Request Lifecycle

```
1. orcyn prove --elf fib --stdin stdin.bin   →  API stores ELF (elfs/<sha256>) + stdin
2. API inserts job (status=queued)            →  Postgres
3. worker POST /v1/workers/claim              →  job assigned (FOR UPDATE SKIP LOCKED), lease 60s
4. worker downloads ELF/stdin, POST start, proves, heartbeats every 10s
5. worker POST submit (proof bytes)           →  status=fulfilled
6. CLI polls status → orcyn download → verify (local or Sepolia)
```

Job states:

```
queued → assigned → proving → fulfilled
   ▲         │          │
   │         └──────────┴──→ failed (permanent, or out of attempts)
   └──── retry / lease expired ──┘
```

If a worker's heartbeat stops (lease expires), the lease reaper puts the job back to `queued`
(or `failed` after max attempts, default 3).

Proof modes: `core`, `compressed`, `groth16`, `plonk`.

---

## 7. CLI

```
orcyn login                       # Phase 1: paste API key; Phase 2: GitHub device flow
orcyn keys create|list|revoke
orcyn prove --elf ./program --stdin input.bin [--mode groth16|plonk|compressed]
orcyn status <request-id>
orcyn download <request-id> -o proof.bin
orcyn verify <proof-file>
orcyn usage
```

### Installation

```
curl -fsSL https://orcyn.xyz/install.sh | bash   # primary
cargo install orcyn-cli                          # alternative
brew install orcyn/tap/orcyn                     # alternative (later)
```

- Releases are built with **cargo-dist**: cross-compiled binaries, GitHub Releases, checksums, a generated `install.sh`.
- `orcyn.xyz/install.sh` redirects to the installer in the latest GitHub release.
- The CLI checks for the SP1 toolchain only when it's needed (local proving or building programs) and tells the user to run `sp1up`.

---

## 8. Authentication

There are two separate concerns:
1. **Identity:** how a person signs up and logs in (GitHub, later Google or wallet).
2. **API authentication:** how the CLI, SDK and CI authenticate each request. Always an Orcyn API key, never the OAuth token.

### Users: opaque API keys

- Format: `orcyn_sk_<64 hex chars>`, sent as `Authorization: Bearer orcyn_sk_...`
- Stored **hashed** (SHA-256) in Postgres, with a visible prefix for identification
- Instant revocation (delete or disable the row)
- Each key belongs to an `account_id`; one account can have many keys
- Why not long-lived JWTs as API keys: they can't be revoked without a blocklist (which brings back the database lookup), a leaked token stays valid until it expires, and the API needs the database for quotas, usage and job ownership anyway

### Phase 1 (demo)

- No OAuth. Keys are created with an admin command: `cargo run -p orcyn-api --bin orcyn-admin -- create-key --account <name>`
- `orcyn login` asks for the key and saves it to `~/.orcyn/config.toml`

### Phase 2: GitHub OAuth device flow (no frontend required)

```
$ orcyn login
! Copy your one-time code: 8F3A-21CD
  Open https://github.com/login/device and enter the code
  Waiting for authorization... ✓
  Logged in as @username. API key saved to ~/.orcyn/config.toml
```

```
orcyn CLI ──(1) request device code──▶ GitHub
          ◀─ user_code + verification URL
user opens github.com/login/device, enters code, approves
orcyn CLI ──(2) polls──▶ GitHub  →  GitHub access token
orcyn CLI ──(3) POST /v1/auth/github {token}──▶ orcyn-api
              orcyn-api calls GitHub /user to confirm who it is,
              creates or finds the account, returns an Orcyn API key
orcyn CLI stores the API key; the GitHub token is thrown away
```

Requirements:
- A GitHub OAuth App with **Device Flow enabled**
- The **client ID** built into the CLI (device flow needs no client secret, so nothing secret ships in the binary)
- One endpoint on `orcyn-api`: `POST /v1/auth/github`
- Previous GitHub OAuth code can be recovered from git commit `a83129e^` (`prover-api/`)

Account model, ready for more login methods:

```
accounts(id, created_at, ...)
identities(account_id, provider, provider_user_id)   -- provider: github | google | wallet
api_keys(id, account_id, prefix, hash, created_at, revoked_at)
```

### Workers

- **Phase 1:** one shared worker token (`ORCYN_WORKER_TOKEN`), compared in constant time, plus an `X-Orcyn-Worker-Id` header. Stored as a Kubernetes Secret on GKE and as a RunPod secret for GPU workers.
- **Later, GKE workers:** Kubernetes **projected service account tokens**, short-lived JWTs that Kubernetes rotates automatically, checked against the cluster's OIDC keys.
- **Later, external workers (RunPod, Phase 3):** these can't get Kubernetes tokens, so they need their own credentials: per-worker tokens (revocable individually) or, in Phase 3, keys tied to a prover identity.

### Where JWT is used

| Use | Phase |
|---|---|
| Worker authentication (Kubernetes service account tokens, GKE workers only) | 2 |
| Web dashboard sessions (JWT or session cookie) | 2, only if a dashboard is built |
| Optional: exchange API key for short-lived (15 min) JWT | Only at high request volume |
| Signed assignment tickets for external provers | 3 |

### Later identity options

- **Google OAuth:** for company accounts
- **Sign-In with Ethereum / signed requests:** Phase 3. Succinct's network identifies requesters by Ethereum key pairs and signs each request (`NETWORK_PRIVATE_KEY`); this is needed for on-chain payments and prover staking.
- **Managed auth** (Clerk, WorkOS, Auth0, Firebase/Identity Platform): an option if auth code becomes a burden

---

## 9. Demo Plan (4 weeks, started 2026-11-13, demo mid-December)

### Week 1: Risk first + foundation
- [x] Cargo workspace, `orcyn-types`, Postgres schema + migrations
- [x] SP1 proving test on CPU (AWS VM; MacBook core proof via the worker)
- [x] Request GCP GPU quota (L4): **denied 2026-11-17**, resubmit after 48 h
- [ ] Groth16 proof on CPU (time + memory)
- [ ] Terraform: GCP project, VPC, GKE cluster (CPU node pools), GCS bucket, DNS

### Week 2: Core services
- [x] `orcyn-api`: API keys, submit request, status, artifacts, worker protocol, lease reaper
- [x] `orcyn-worker`: claim, execute, prove, verify, heartbeat, submit, retry/permanent failures
- [x] `programs/fibonacci` + stdin tool
- [x] End-to-end locally (mock + real CPU proof)
- [ ] Worker Docker image (CPU + CUDA builds)
- [ ] **GPU test on RunPod** (48 GB): core, compressed, **Groth16**, via a temporary tunnel to the dev API

### Week 3: Client + Kubernetes
- [ ] `orcyn-sdk` + `orcyn-cli` with live progress output
- [ ] Helm chart, deploy API + CPU worker to GKE, Ingress + TLS on `api.orcyn.xyz`
- [ ] CloudNativePG + GCS storage backend (API slice 5)
- [ ] RunPod GPU worker pointed at `api.orcyn.xyz` (Terraform)
- [ ] cargo-dist release + `install.sh`

### Week 4: Polish + rehearse
- [ ] End-to-end in production: CLI → GKE API → RunPod GPU worker → proof
- [ ] On-chain verification on Sepolia (SP1 verifier gateway)
- [ ] Rehearse the demo several times
- [ ] **Record a backup demo video**

### Demo script (~3 min)
1. `curl -fsSL https://orcyn.xyz/install.sh | bash`
2. `orcyn prove --elf fibonacci --stdin stdin.bin --mode groth16`, with live status `queued → assigned to gpu-worker-1 → proving → fulfilled`
3. Verify the proof, ideally on-chain on Sepolia
4. *(Optional)* two jobs in parallel on two workers, or CPU vs GPU timing

---

## 10. Later (out of scope for the demo)

- GitHub OAuth device-flow login (see §8)
- RunPod autoscaler in GKE (start/stop GPU pods by queue depth)
- GPU node pool on GKE once quota is granted (Spot GPUs for cost)
- Per-worker tokens / Kubernetes service account tokens for workers
- Optional web dashboard (only if users ask): usage graphs, proof history, key management
- Billing (Stripe), quotas, usage metering
- Observability: Prometheus, Grafana, tracing
- Redis, if Postgres queueing becomes a bottleneck
- Phase 3: prover registration, staking, auctions/assignment, slashing, on-chain settlement, explorer
