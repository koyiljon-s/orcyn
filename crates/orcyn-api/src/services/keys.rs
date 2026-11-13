//! API key generation and hashing.
//!
//! Key format: `orcyn_sk_` + 64 hex characters (32 random bytes = 256 bits).
//!
//! Why plain SHA-256 and not a password hash like argon2? Password hashes are
//! deliberately slow to stop people guessing *weak human passwords*. Our keys
//! are 256 bits of randomness, so they can't be guessed no matter how fast the
//! hash is, and a fast hash keeps every authenticated request cheap.

use rand::RngExt;
use sha2::{Digest, Sha256};

pub const KEY_PREFIX: &str = "orcyn_sk_";

/// How many characters of the key we store in plain text for display.
const DISPLAY_PREFIX_LEN: usize = KEY_PREFIX.len() + 4;

/// A freshly generated key. `plaintext` is shown to the user exactly once.
pub struct NewApiKey {
    pub plaintext: String,
    pub display_prefix: String,
    pub hash: [u8; 32],
}

pub fn generate() -> NewApiKey {
    let bytes: [u8; 32] = rand::rng().random();
    let plaintext = format!("{KEY_PREFIX}{}", hex::encode(bytes));

    NewApiKey {
        display_prefix: plaintext[..DISPLAY_PREFIX_LEN].to_string(),
        hash: hash(&plaintext),
        plaintext,
    }
}

/// SHA-256 of the full key string. This is what we store and look up.
pub fn hash(key: &str) -> [u8; 32] {
    Sha256::digest(key.as_bytes()).into()
}

/// Cheap shape check before touching the database.
pub fn looks_valid(key: &str) -> bool {
    key.strip_prefix(KEY_PREFIX)
        .is_some_and(|rest| rest.len() == 64 && rest.bytes().all(|b| b.is_ascii_hexdigit()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generated_keys_have_expected_shape() {
        let key = generate();
        assert!(looks_valid(&key.plaintext));
        assert!(key.plaintext.starts_with(&key.display_prefix));
        assert_eq!(key.hash, hash(&key.plaintext));
    }

    #[test]
    fn keys_are_unique() {
        assert_ne!(generate().plaintext, generate().plaintext);
    }

    #[test]
    fn rejects_malformed_keys() {
        assert!(!looks_valid(""));
        assert!(!looks_valid("orcyn_sk_short"));
        assert!(!looks_valid(&format!("wrong_sk_{}", "a".repeat(64))));
        assert!(!looks_valid(&format!("orcyn_sk_{}", "z".repeat(64))));
    }
}
