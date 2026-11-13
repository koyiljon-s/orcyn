CREATE TABLE proof_requests (
    id                UUID PRIMARY KEY,
    account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    mode              TEXT NOT NULL
                      CHECK (mode IN ('core', 'compressed', 'groth16', 'plonk')),
    status            TEXT NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued', 'assigned', 'proving', 'fulfilled', 'failed')),

    -- Storage keys (paths inside the artifact store), not full URLs.
    -- ELFs are content-addressed: elfs/<sha256>, shared between requests.
    program_hash      TEXT NOT NULL,
    elf_key           TEXT NOT NULL,
    stdin_key         TEXT NOT NULL,
    proof_key         TEXT,

    -- Coordinator fields (used from slice 4).
    worker_id         TEXT,
    lease_expires_at  TIMESTAMPTZ,
    attempts          INT NOT NULL DEFAULT 0,
    error             TEXT,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- "My requests, newest first" (GET /v1/requests).
CREATE INDEX proof_requests_account_created_idx
    ON proof_requests (account_id, created_at DESC);

-- "Oldest queued job" (worker claim, slice 4). Partial index: only queued rows.
CREATE INDEX proof_requests_queued_idx
    ON proof_requests (created_at)
    WHERE status = 'queued';
