import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { Panel } from "@/components/sections/home/Panel";

const phases = [
  {
    phase: "Phase 1",
    status: "Building now",
    current: true,
    title: "Hosted proving network",
    points: ["Proving API, job queue and CLI", "Provers operated by Orcyn on CPU and GPU", "Early access for design partners"],
  },
  {
    phase: "Phase 2",
    status: "Next",
    current: false,
    title: "Production service",
    points: ["GitHub login and self-serve API keys", "Usage-based billing and quotas", "Monitoring and SLAs"],
  },
  {
    phase: "Phase 3",
    status: "Later",
    current: false,
    title: "Open prover network",
    points: ["Anyone with GPUs can run an Orcyn prover", "Staking, bidding and on-chain settlement", "Public explorer for proof requests"],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="tone-light bg-page scroll-mt-20 py-24 md:py-36">
      <Container>
        <SectionHeading eyebrow="Roadmap" titleId="roadmap-title" title="Hosted today. Open network tomorrow.">
          We&apos;re starting with a network we run ourselves, so proofs are fast and reliable from
          day one. The same protocol opens to independent provers next.
        </SectionHeading>

        <ol aria-labelledby="roadmap-title" className="mt-16 grid gap-6 lg:grid-cols-3">
          {phases.map(({ phase, status, current, title, points }) => (
            <li key={phase}>
              <Panel className={`h-full p-8 ${current ? "border-fg/40" : ""}`}>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-sm text-subtle">{phase}</span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${current ? "bg-invert text-on-invert" : "border border-line text-subtle"}`}
                  >
                    {current && <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />}
                    {status}
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-fg md:text-3xl">{title}</h3>
                <ul className="mt-5 space-y-3">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3 text-base leading-relaxed text-subtle">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-fg/30" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Panel>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
