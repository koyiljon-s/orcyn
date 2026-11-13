use std::fmt;

/// Returned when a string isn't a known enum value, e.g. `"groth17".parse::<ProofMode>()`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseEnumError {
    pub kind: &'static str,
    pub value: String,
    pub expected: &'static [&'static str],
}

impl fmt::Display for ParseEnumError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "unknown {} '{}' (expected one of: {})",
            self.kind,
            self.value,
            self.expected.join(", ")
        )
    }
}

impl std::error::Error for ParseEnumError {}
