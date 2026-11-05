# Orcyn

**GPU-accelerated Zero-Knowledge Proof generation in Rust**

Quicksilicon is a research and engineering project focused on building high-performance zero-knowledge provers that leverage modern GPUs (CUDA & Metal) to accelerate the most expensive cryptographic operations — primarily Multi-Scalar Multiplication (MSM) and Number Theoretic Transforms (NTT).

The goal is to make advanced blockchain protocols (zk-rollups, verifiable computation, privacy systems, and zkML) significantly faster and more practical.

## Why Quicksilicon?

Zero-knowledge proofs are one of the most important building blocks of modern blockchain technology, but proof generation is still computationally heavy. The bottlenecks in almost every proving system map extremely well to GPUs.

Quicksilicon explores how far we can push proving performance in pure Rust by combining:

- High-level zkVMs (like SP1)
- Low-level cryptographic libraries (arkworks)
- Production-grade GPU acceleration (ICICLE and others)

## Features

- [ ] Fast CPU baseline provers
- [ ] GPU-accelerated MSM & NTT
- [ ] Support for multiple proof systems (Groth16, STARKs, Plonkish)
- [ ] Clean and reproducible benchmarks (CPU vs GPU)
- [ ] Practical example circuits and zkVM programs
- [ ] Simple library + CLI interface
- [ ] Experiments with recursion and batch proving

## Tech Stack

| Layer              | Technology                     | Notes |
|--------------------|--------------------------------|-------|
| Language           | Rust                           | Core language |
| High-level zkVM    | SP1                            | Excellent developer experience |
| Cryptographic core | arkworks                       | Maximum flexibility |
| GPU Acceleration   | ICICLE / SP1 GPU / Metal       | CUDA preferred, Metal supported |
| Proof Systems      | Groth16, STARKs, others        | Starting with mature systems |

## Getting Started

### Prerequisites

- Rust (latest stable + nightly recommended)
- NVIDIA GPU + CUDA Toolkit **or** Apple Silicon
- Basic build tools (`cmake`, `gcc`/`clang`)

### Quick Start

```bash
git clone https://github.com/<your-username>/quicksilicon.git
cd quicksilicon

# Follow SP1 installation instructions
curl -L https://sp1.succinct.xyz | bash
sp1up

# Run examples
cargo run --release --example fibonacci
