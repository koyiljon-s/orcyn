//! Wraps sp1-sdk: turns (ELF, stdin, mode) into proof bytes.

use std::collections::HashMap;
use std::time::Instant;

use anyhow::Context;
use orcyn_types::ProofMode;
use sp1_sdk::env::{EnvProver, EnvProvingKey};
use sp1_sdk::{CpuProver, Elf, MockProver, ProveRequest, Prover as _, ProvingKey as _, SP1Stdin};

use crate::config::ProverKind;

/// Why a proof attempt failed, and whether trying again could help.
#[derive(Debug, thiserror::Error)]
#[error("{message}")]
pub struct ProveError {
    pub message: String,
    /// false = the input is bad (invalid ELF/stdin, program panics):
    /// every retry would fail the same way.
    pub retryable: bool,
}

impl ProveError {
    fn permanent(err: impl std::fmt::Display) -> Self {
        ProveError { message: err.to_string(), retryable: false }
    }
    fn temporary(err: impl std::fmt::Display) -> Self {
        ProveError { message: err.to_string(), retryable: true }
    }
}

pub struct Prover {
    sp1: EnvProver,
    /// Proving keys by program hash. `setup` is expensive and the same
    /// program is often proved many times, so each key is computed once.
    keys: HashMap<String, EnvProvingKey>,
}

impl Prover {
    pub async fn new(kind: ProverKind) -> anyhow::Result<Self> {
        // EnvProver is SP1's "one of several provers" enum. We pick the
        // variant from our own config instead of the SP1_PROVER env var.
        let sp1 = match kind {
            ProverKind::Mock => EnvProver::Mock(MockProver::new().await),
            ProverKind::Cpu => EnvProver::Cpu(CpuProver::new().await),
            ProverKind::Cuda => cuda_prover().await?,
        };
        Ok(Prover { sp1, keys: HashMap::new() })
    }

    /// Executes, proves, verifies. Returns the bincode-serialized
    /// `SP1ProofWithPublicValues`, the same format as `proof.save(path)`.
    pub async fn prove(
        &mut self,
        program_hash: &str,
        elf: Vec<u8>,
        stdin: &[u8],
        mode: ProofMode,
    ) -> Result<Vec<u8>, ProveError> {
        let stdin: SP1Stdin = bincode::deserialize(stdin)
            .map_err(|e| ProveError::permanent(format!("stdin is not a serialized SP1Stdin: {e}")))?;
        let elf = Elf::from(elf);

        // 1. Execute first: cheap compared to proving, and catches programs
        //    that panic before we spend minutes (or GPU money) on them.
        let started = Instant::now();
        let (_, report) = self
            .sp1
            .execute(elf.clone(), stdin.clone())
            .await
            .map_err(|e| ProveError::permanent(format!("program execution failed: {e}")))?;
        tracing::info!(
            cycles = report.total_instruction_count(),
            took_ms = started.elapsed().as_millis() as u64,
            "program executed"
        );

        // 2. Proving key (cached per program).
        if !self.keys.contains_key(program_hash) {
            let started = Instant::now();
            let pk = self
                .sp1
                .setup(elf)
                .await
                .map_err(|e| ProveError::permanent(format!("setup failed: {e}")))?;
            tracing::info!(took_ms = started.elapsed().as_millis() as u64, "proving key ready");
            self.keys.insert(program_hash.to_string(), pk);
        }
        let pk = &self.keys[program_hash];

        // 3. Prove. This is the slow part.
        let started = Instant::now();
        let request = self.sp1.prove(pk, stdin);
        let proof = match mode {
            ProofMode::Core => request.core().await,
            ProofMode::Compressed => request.compressed().await,
            ProofMode::Groth16 => request.groth16().await,
            ProofMode::Plonk => request.plonk().await,
        }
        // Execution already succeeded, so a proving failure is most likely
        // resources (memory, GPU): worth retrying on another worker.
        .map_err(|e| ProveError::temporary(format!("proving failed: {e}")))?;
        tracing::info!(took_ms = started.elapsed().as_millis() as u64, "proof generated");

        // 4. Never hand out a proof we haven't checked ourselves.
        self.sp1
            .verify(&proof, pk.verifying_key(), None)
            .map_err(|e| ProveError::temporary(format!("generated proof failed verification: {e}")))?;

        bincode::serialize(&proof)
            .context("serializing proof")
            .map_err(ProveError::temporary)
    }
}

#[cfg(feature = "cuda")]
async fn cuda_prover() -> anyhow::Result<EnvProver> {
    // Starts SP1's GPU server (~/.sp1/bin/sp1-gpu-server) as a child process.
    Ok(EnvProver::Cuda(sp1_sdk::ProverClient::builder().cuda().build().await))
}

#[cfg(not(feature = "cuda"))]
async fn cuda_prover() -> anyhow::Result<EnvProver> {
    anyhow::bail!("this binary was built without the `cuda` feature (Linux + NVIDIA only)")
}
