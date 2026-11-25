/** Product-mockup copy used by more than one section. */
export const jobStates = [
  { name: "queued", detail: "waiting for a prover" },
  { name: "assigned", detail: "gpu-worker-1 · lease 60s" },
  { name: "proving", detail: "heartbeat ok · heartbeat ok" },
  { name: "fulfilled", detail: "proof verified · ready to download" },
];

export const proofModes = [
  { name: "core", detail: "STARK · fastest to generate", selected: false },
  { name: "compressed", detail: "STARK · constant size, recursive", selected: false },
  { name: "groth16", detail: "SNARK · cheapest to verify on-chain", selected: true },
  { name: "plonk", detail: "SNARK · on-chain, universal setup", selected: false },
];
