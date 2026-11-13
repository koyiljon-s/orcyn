# Orcyn Blueprint

Orcyn is a zero-knowledge prover network for SP1 programs, inspired by the Succinct Prover Network.
Users submit an SP1 program (ELF) plus input, and the network returns a verifiable proof.

---

## 1. Strategy

| Phase | Scope | Goal |
|---|---|---|
| **Phase 1: Private network (demo, ~1 month)** | Orcyn operates all provers (workers) in its own GKE cluster. No "prover" user type. | Show the core value: *submit program → get verified ZK proof* |
| **Phase 2: Production service** | Billing, quotas, OAuth login, observability, multi-region | Real users |
| **Phase 3: Open network** | External provers, staking, bidding/assignment, slashing, on-chain settlement, explorer | Decentralized marketplace |

**Key rule for Phase 1:** workers talk to the API only through a clean HTTP protocol
(`claim` / `heartbeat` / `submit`) and never touch the database directly. Later, an external
prover is just a worker run by someone else, plus staking and verification, so no rewrite is needed.

---

## 2. Decisions

- **Language:** Rust (Cargo workspace)
- **Proving stack:** SP1 (`sp1-sdk`), CPU and CUDA provers
- **Cloud:** Google Cloud Platform
- **Orchestration:** GKE (Kubernetes) + Helm
- **Infrastructure as code:** Terraform
- **Database:** Cloud SQL (PostgreSQL); also used as the job queue (`FOR UPDATE SKIP LOCKED`)
- **Artifacts:** GCS bucket (ELF, stdin, proofs)
- **Redis:** not used in Phase 1; add only if needed
- **Interface:** CLI-first (`orcyn`), backed by a Rust SDK. Web dashboard is deferred.
- **Auth:** opaque API keys for users (Phase 1: created by an admin command; Phase 2: issued after GitHub device-flow login). Workers use a shared token first, then Kubernetes service account JWTs. See [§7](#7-authentication).
- **Frontend:** not required for auth. GitHub hosts the device-flow approval page. A dashboard is optional.
- **Domain:** `orcyn.xyz`

### Subdomains

| Subdomain | Purpose |
|---|---|
| `orcyn.xyz` | Landing page (`web/`) + `install.sh` |
| `api.orcyn.xyz` | Prove API (used by CLI/SDK) |
| `app.orcyn.xyz` | Optional dashboard (later, only if users ask) |
| `docs.orcyn.xyz` | Documentation (later) |
| `rpc.orcyn.xyz` | External prover endpoint (Phase 3) |
| `explorer.orcyn.xyz` | Public proof request explorer (Phase 3) |

---

## 3. Repository Structure

```
orcyn/
├── Cargo.toml                  # Rust workspace root
├── rust-toolchain.toml
├── crates/
│   ├── orcyn-types/            # Shared types: ProofRequest, JobStatus, ProofMode, API DTOs
│   ├── orcyn-api/              # Axum server: auth (API keys), requests, artifacts, job queue
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── routes/         # /v1/requests, /v1/keys, /v1/workers (claim/heartbeat/submit)
│   │   │   ├── services/       # business logic
│   │   │   ├── repo/           # Postgres queries
│   │   │   └── storage/        # GCS artifact store (ELF, stdin, proofs)
│   │   └── migrations/         # SQL migrations (sqlx)
│   ├── orcyn-worker/           # Claims jobs, runs SP1 prover (CPU or CUDA), uploads proof
│   ├── orcyn-sdk/              # Rust client library used by users & CLI
│   └── orcyn-cli/              # `orcyn` binary: login, keys, prove, status, download
├── programs/
│   └── fibonacci/              # Example SP1 guest program used in the demo
├── deploy/
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── worker-cpu.Dockerfile
│   │   └── worker-gpu.Dockerfile   # CUDA base image
│   ├── helm/orcyn/             # One chart: api, workers, ingress, config
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── local/
│       └── docker-compose.yml  # Postgres for local dev
├── infra/terraform/            # GCP: VPC, GKE, node pools, Cloud SQL, GCS, DNS, IAM
├── .github/workflows/          # CI: test, build images, cargo-dist releases
├── docs/
└── web/                        # Landing page (later)
```

---

## 4. Deployment on GCP

```
                         orcyn.xyz (Cloud DNS)
                                │
   orcyn CLI / SDK ──HTTPS──▶  api.orcyn.xyz
                                │  GKE Ingress + managed TLS cert
┌───────────────────────────────┼──────────────────── GKE cluster ──────────┐
│                               ▼                                            │
│   ┌──────────────┐   default node pool (e2-standard-4)                     │
│   │  orcyn-api   │   Deployment ×2                                         │
│   └──────┬───────┘                                                         │
│          │ claim / heartbeat / submit (HTTP, worker token)                 │
│     ┌────┴─────────────────────┐                                           │
│     ▼                          ▼                                           │
│ ┌──────────────┐        ┌──────────────┐                                   │
│ │ worker-cpu   │        │ worker-gpu   │  gpu node pool (g2-standard-8 +   │
│ │ Deployment   │        │ Deployment   │  NVIDIA L4), autoscale 0→N        │
│ └──────────────┘        └──────────────┘                                   │
│   cpu node pool (n2-highmem-8)                                             │
└──────────┬─────────────────────────────┬───────────────────────────────────┘
           ▼                             ▼
   Cloud SQL (Postgres)          GCS bucket: elfs/ stdin/ proofs/
   tenants, keys, jobs, usage    (accessed via Workload Identity)
```

Notes:
- **The GPU node pool autoscales to 0** so it costs nothing while idle. Cold start is about 3–5 minutes, so scale it up before a demo.
- **GPU quota:** new GCP projects often start with 0 GPUs. Request **L4** quota early (approval can take days). H100 quota is much harder to get.
- **Workload Identity** gives pods access to GCS and Cloud SQL without key files.

---

## 5. Proof Request Lifecycle

```
1. orcyn prove --elf fib --stdin 1000   →  SDK uploads ELF + stdin  →  GCS
2. API inserts job (status=queued)       →  Postgres
3. worker polls /v1/workers/claim        →  job assigned (row lock, SKIP LOCKED)
4. worker downloads ELF/stdin, proves, heartbeats every 10s
5. worker uploads proof → GCS, calls /submit  →  status=fulfilled
6. CLI polling shows progress → orcyn download → verify (local or Sepolia)
```

Job states:

```
queued → assigned → proving → fulfilled
                       │
                       └──→ failed (retry → queued, until max attempts)
```

If a worker's heartbeat stops (lease expires), the job goes back to `queued`.

Proof modes: `core`, `compressed`, `groth16`, `plonk`.

---

## 6. CLI

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

## 7. Authentication

There are two separate concerns:
1. **Identity:** how a person signs up and logs in (GitHub, later Google or wallet).
2. **API authentication:** how the CLI, SDK and CI authenticate each request. Always an Orcyn API key, never the OAuth token.

### Users: opaque API keys

- Format: `orcyn_sk_<random>`, sent as `Authorization: Bearer orcyn_sk_...`
- Stored **hashed** (SHA-256) in Postgres, with a visible prefix for identification
- Instant revocation (delete or disable the row)
- Each key belongs to an `account_id`; one account can have many keys
- Why not long-lived JWTs as API keys: they can't be revoked without a blocklist (which brings back the database lookup), a leaked token stays valid until it expires, and the API needs the database for quotas, usage and job ownership anyway

### Phase 1 (demo)

- No OAuth. Keys are created with an admin command: `orcyn-api admin create-key --account <name>`
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

- **Week 1–2:** static shared worker token stored in a Kubernetes Secret
- **Later:** Kubernetes **projected service account tokens**, short-lived JWTs that Kubernetes rotates automatically, checked by the API against the cluster's OIDC keys. No secrets to manage by hand.

### Where JWT is used

| Use | Phase |
|---|---|
| Worker authentication (Kubernetes service account tokens) | 1–2 |
| Web dashboard sessions (JWT or session cookie) | 2, only if a dashboard is built |
| Optional: exchange API key for short-lived (15 min) JWT | Only at high request volume |
| Signed assignment tickets for external provers | 3 |

### Later identity options

- **Google OAuth:** for company accounts
- **Sign-In with Ethereum / signed requests:** Phase 3. Succinct's network identifies requesters by Ethereum key pairs and signs each request (`NETWORK_PRIVATE_KEY`); this is needed for on-chain payments and prover staking.
- **Managed auth** (Clerk, WorkOS, Auth0, Firebase/Identity Platform): an option if auth code becomes a burden

---

## 8. Demo Plan (4 weeks)

### Week 1: Risk first + foundation
- [ ] Request GCP GPU quota (L4)
- [ ] Standalone SP1 proving test (compressed + Groth16) on CPU, then on GPU
- [ ] Cargo workspace skeleton, `orcyn-types`, Postgres schema + migrations
- [ ] Terraform: VPC, GKE cluster, node pools, Cloud SQL, GCS bucket

### Week 2: Core services
- [ ] `orcyn-api`: API keys, submit request, status, artifact upload/download, worker endpoints
- [ ] `orcyn-worker`: claim, prove, heartbeat, submit, retry on failure
- [ ] End-to-end locally (docker-compose Postgres + CPU worker)

### Week 3: Client + Kubernetes
- [ ] `orcyn-sdk` + `orcyn-cli` with live progress output
- [ ] Dockerfiles (api, worker-cpu, worker-gpu)
- [ ] Helm chart, deploy to GKE, Ingress + TLS on `api.orcyn.xyz`
- [ ] cargo-dist release + `install.sh`

### Week 4: Polish + rehearse
- [ ] End-to-end on GKE with the GPU worker
- [ ] On-chain verification on Sepolia (SP1 verifier gateway)
- [ ] Rehearse the demo several times
- [ ] **Record a backup demo video**

### Demo script (~3 min)
1. `curl -fsSL https://orcyn.xyz/install.sh | bash`
2. `orcyn prove --elf fibonacci --stdin 1000 --mode groth16`, with live status `queued → assigned to gpu-worker-1 → proving → fulfilled`
3. Verify the proof, ideally on-chain on Sepolia
4. *(Optional)* two jobs in parallel on two workers, or CPU vs GPU timing

---

## 9. Later (out of scope for the demo)

- GitHub OAuth device-flow login (see §7)
- Optional web dashboard (only if users ask): usage graphs, proof history, key management
- Billing (Stripe), quotas, usage metering
- Observability: Prometheus, Grafana, tracing
- Redis, if Postgres queueing becomes a bottleneck
- Phase 3: prover registration, staking, auctions/assignment, slashing, on-chain settlement, explorer
