import { Boxes, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { Card } from "@/components/sections/home/Panel";

/** Visual: a job moving through its states, as the API reports it. */
function JobTimeline() {
  const states = [
    { name: "queued", detail: "waiting for a prover", done: true },
    { name: "assigned", detail: "gpu-worker-1 · lease 60s", done: true },
    { name: "proving", detail: "heartbeat ok · heartbeat ok", done: true },
    { name: "fulfilled", detail: "proof verified · ready to download", done: true, final: true },
  ];
  return (
    <ol className="border-y border-line">
      {states.map(({ name, detail, final }) => (
        <li key={name} className="flex items-center gap-4 border-b border-line py-4 last:border-b-0">
          <span
            className={`flex size-6 shrink-0 items-center justify-center border text-xs text-fg ${final ? "border-fg bg-lime" : "border-line"}`}
            aria-hidden="true"
          >
            ✓
          </span>
          <span className="w-20 shrink-0 font-mono text-sm text-fg">{name}</span>
          <span className="font-mono text-xs text-muted-fg sm:text-sm">{detail}</span>
        </li>
      ))}
    </ol>
  );
}

/** Visual: the four SP1 proof types, like an options picker. */
function ProofModes() {
  const modes = [
    { name: "core", detail: "STARK · fastest to generate", selected: false },
    { name: "compressed", detail: "STARK · constant size, recursive", selected: false },
    { name: "groth16", detail: "SNARK · cheapest to verify on-chain", selected: true },
    { name: "plonk", detail: "SNARK · on-chain, universal setup", selected: false },
  ];
  return (
    <ul className="space-y-2">
      {modes.map(({ name, detail, selected }) => (
        <li
          key={name}
          className={`flex items-center justify-between gap-4 border px-5 py-4 ${selected ? "border-fg bg-fg text-white" : "border-line text-fg"}`}
        >
          <span className="font-mono text-sm font-medium">--mode {name}</span>
          <span className={`hidden text-sm sm:block ${selected ? "text-subtle" : "text-muted-fg"}`}>{detail}</span>
        </li>
      ))}
    </ul>
  );
}

const smallFeatures = [
  {
    icon: RefreshCw,
    title: "Fault-tolerant",
    body: "Jobs hold leases kept alive by heartbeats. If a prover crashes, the job is reassigned automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Verified before delivery",
    body: "Programs are executed before proving and every proof is verified before you get it.",
  },
  {
    icon: Boxes,
    title: "Fast on repeat",
    body: "Programs are stored by content hash and proving keys are cached across requests.",
  },
  {
    icon: KeyRound,
    title: "API and CLI",
    body: "API keys, a small REST API and the orcyn CLI. Scriptable in CI.",
  },
];

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-16 border-t border-line py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Features" titleId="features-title" title="Proving infrastructure you don't have to run." />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Card accent="pink" className="p-6 sm:p-10">
            <h3 className="text-2xl font-medium tracking-[-0.03em] text-fg md:text-3xl">Live job status</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-fg md:text-lg">
              Follow every request from queued to fulfilled, including which prover has it.
            </p>
            <div className="mt-8">
              <JobTimeline />
            </div>
          </Card>

          <Card accent="blue" className="p-6 sm:p-10">
            <h3 className="text-2xl font-medium tracking-[-0.03em] text-fg md:text-3xl">Every SP1 proof type</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-fg md:text-lg">
              STARKs for speed and recursion, SNARKs for cheap verification on Ethereum.
            </p>
            <div className="mt-8">
              <ProofModes />
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {smallFeatures.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-7">
              <Icon className="size-6 text-fg" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-6 text-lg font-medium tracking-[-0.03em] text-fg">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-fg">{body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
