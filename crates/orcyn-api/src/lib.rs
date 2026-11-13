//! orcyn-api as a library.
//!
//! This package builds two binaries: the server (`src/main.rs`) and the
//! admin tool (`src/bin/admin.rs`). Both import shared code from here as
//! `orcyn_api::...`. A binary can't import from another binary, only from
//! a library, which is why this file exists.

pub mod auth;
pub mod config;
pub mod db;
pub mod error;
pub mod repo;
pub mod routes;
pub mod services;
pub mod state;
pub mod storage;
pub mod tasks;
