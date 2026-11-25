import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { Card, type Accent } from "@/components/sections/home/Panel";

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

const accents: Accent[] = ["pink", "blue", "navy"];

export default function Roadmap() {
  return (
    <section id="roadmap" aria-labelledby="roadmap-title" className="scroll-mt-16 border-t border-line py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Roadmap" titleId="roadmap-title" title="Hosted today. Open network tomorrow.">
          We&apos;re starting with a network we run ourselves, so proofs are fast and reliable from
          day one. The same protocol opens to independent provers next.
        </SectionHeading>

        <ol className="mt-14 grid gap-6 lg:grid-cols-3">
          {phases.map(({ phase, status, current, title, points }, i) => (
            <li key={phase}>
              <Card accent={accents[i]} className="p-8">
                <div className="flex items-center justify-between gap-4 font-mono text-[13px]">
                  <span className="text-muted-fg">{phase}</span>
                  <span className={`inline-flex items-center gap-2 px-2.5 py-1 ${current ? "bg-fg text-white" : "bg-chip text-fg"}`}>
                    {current && <span className="size-1.5 bg-lime" aria-hidden="true" />}
                    {status}
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-medium tracking-[-0.03em] text-fg">{title}</h3>
                <ul className="mt-5 space-y-3">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3 text-base leading-relaxed text-muted-fg">
                      <span className="mt-2.5 size-1.5 shrink-0 bg-subtle" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
