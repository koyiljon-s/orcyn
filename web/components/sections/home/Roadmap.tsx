import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";

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
    <section id="roadmap" aria-labelledby="road-title" className="relative bg-page py-24 text-fg md:py-36">
      <Container>
        <SectionHeading titleId="road-title" eyebrow="Roadmap" title="Hosted today. Open network tomorrow.">
          We&apos;re starting with a network we run ourselves, so proofs are fast and reliable from
          day one. The same protocol opens to independent provers next.
        </SectionHeading>
        <ol className="mt-16 grid border border-fg lg:grid-cols-3">
          {phases.map(({ phase, status, current, title, points }) => (
            <li key={phase} className="border-b border-fg last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <p className="flex border-b border-fg text-[13px] uppercase">
                <span className={`border-r border-fg px-4 py-2.5 ${current ? "bg-pink text-[#00050a]" : ""}`}>{phase}</span>
                <span className="px-4 py-2.5 text-muted-fg">{status}</span>
              </p>
              <div className="p-7 sm:p-9">
                <h3 className="text-2xl font-normal tracking-[-0.04em] text-fg md:text-3xl">{title}</h3>
                <ul className="mt-6 space-y-2.5">
                  {points.map((point) => (
                    <li key={point} className="text-[17px] leading-relaxed text-muted-fg">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
