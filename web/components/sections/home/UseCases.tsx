import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { Panel } from "@/components/sections/home/Panel";

const useCases = [
  { title: "Rollups & L2s", body: "Prove state transitions and settle on Ethereum with a single Groth16 or Plonk proof." },
  { title: "Bridges & light clients", body: "Prove another chain's consensus instead of trusting a multisig." },
  { title: "Coprocessors", body: "Run heavy computation off-chain and bring a proof of the result back on-chain." },
  { title: "Verifiable compute & zkML", body: "Prove that a specific program or model produced a result, without re-running it." },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="bg-page scroll-mt-20 py-24 md:py-36">
      <Container>
        <SectionHeading eyebrow="Use cases" titleId="use-cases-title" title="If it compiles to SP1, Orcyn proves it.">
          For teams shipping provable software on Ethereum and beyond.
        </SectionHeading>

        <div aria-labelledby="use-cases-title" className="mt-16 grid gap-6 sm:grid-cols-2">
          {useCases.map(({ title, body }, i) => (
            <Panel key={title} className="flex min-h-64 flex-col justify-between p-8 md:p-10">
              <span className="font-mono text-sm text-subtle">0{i + 1}</span>
              <div className="mt-10">
                <h3 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-fg md:text-4xl">{title}</h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-subtle">{body}</p>
              </div>
            </Panel>
          ))}
        </div>
      </Container>
    </section>
  );
}
