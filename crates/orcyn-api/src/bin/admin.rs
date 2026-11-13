//! orcyn-admin: operator commands that talk to the database directly.
//!
//!   cargo run -p orcyn-api --bin orcyn-admin -- create-key --account demo
//!
//! Everything after `--` goes to this program instead of to cargo.

use anyhow::Context;
use clap::{Parser, Subcommand};

use orcyn_api::services::keys;
use orcyn_api::{db, repo};

#[derive(Parser)]
#[command(name = "orcyn-admin", about = "Orcyn operator tools")]
struct Cli {
    /// Postgres connection string. Falls back to the DATABASE_URL env var.
    #[arg(long, env = "DATABASE_URL", hide_env_values = true)]
    database_url: String,

    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Create an API key (and the account, if it doesn't exist yet).
    CreateKey {
        /// Account name, e.g. "demo".
        #[arg(long)]
        account: String,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::from_path(concat!(env!("CARGO_MANIFEST_DIR"), "/.env")).ok();

    let cli = Cli::parse();
    let db = db::connect(&cli.database_url).await?;

    match cli.command {
        Command::CreateKey { account } => {
            let account_id = repo::accounts::get_or_create(&db, &account)
                .await
                .context("failed to create account")?;

            let key = keys::generate();
            repo::api_keys::insert(&db, account_id, &key.display_prefix, &key.hash)
                .await
                .context("failed to store API key")?;

            println!("Account: {account} ({account_id})");
            println!("API key: {}", key.plaintext);
            println!();
            println!("Save this key now. It is stored hashed and cannot be shown again.");
        }
    }

    Ok(())
}
