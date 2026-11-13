-- API keys authenticate the CLI/SDK. We never store the key itself,
-- only its SHA-256 hash, so a database leak doesn't leak usable keys.
CREATE TABLE api_keys (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    -- First characters of the key (e.g. "orcyn_sk_3f9a"), safe to display
    -- so users can tell their keys apart.
    prefix        TEXT NOT NULL,
    key_hash      BYTEA NOT NULL UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at  TIMESTAMPTZ,
    revoked_at    TIMESTAMPTZ
);

CREATE INDEX api_keys_account_id_idx ON api_keys (account_id);
