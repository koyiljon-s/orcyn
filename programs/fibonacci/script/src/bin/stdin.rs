//! Writes the program input (SP1Stdin) to a file, ready to upload to Orcyn.
//!
//!   cargo run --release --bin stdin -- --n 1000 --out stdin.bin
//!
//! Format: bincode-serialized `SP1Stdin`. orcyn-worker reads it back the same way.
//! (Later, `orcyn prove --input ...` will build this file for you.)

use clap::Parser;
use sp1_sdk::SP1Stdin;

#[derive(Parser)]
struct Args {
    /// Which fibonacci number to compute.
    #[arg(long, default_value = "20")]
    n: u32,

    /// Output file.
    #[arg(long, default_value = "stdin.bin")]
    out: String,
}

fn main() {
    let args = Args::parse();

    // Same as the template's main.rs: the program reads one u32.
    let mut stdin = SP1Stdin::new();
    stdin.write(&args.n);

    let bytes = bincode::serialize(&stdin).expect("failed to serialize stdin");
    std::fs::write(&args.out, &bytes).expect("failed to write file");
    println!("wrote {} ({} bytes) for n = {}", args.out, bytes.len(), args.n);
}
