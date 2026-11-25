import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { Card, type Accent } from "@/components/sections/home/Panel";

const useCases = [
  { title: "Rollups & L2s", body: "Prove state transitions and settle on Ethereum with a single Groth16 or Plonk proof." },
  { title: "Bridges & light clients", body: "Prove another chain's consensus instead of trusting a multisig." },
  { title: "Coprocessors", body: "Run heavy computation off-chain and bring a proof of the result back on-chain." },
  { title: "Verifiable compute & zkML", body: "Prove that a specific program or model produced a result, without re-running it." },
];

const accents: Accent[] = ["pink", "blue", "navy", "pink"];

export default function UseCases() {
  return (
    <section id="use-cases" aria-labelledby="use-cases-title" className="scroll-mt-16 border-t border-line py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Use cases" titleId="use-cases-title" title="If it compiles to SP1, Orcyn proves it.">
          For teams shipping provable software on Ethereum and beyond.
        </SectionHeading>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {useCases.map(({ title, body }, i) => (
            <Card key={title} accent={accents[i]} className="flex flex-col justify-between gap-12 p-8 md:p-10">
              <span className="font-mono text-[13px] text-muted-fg">0{i + 1}</span>
              <div>
                <h3 className="text-2xl font-medium leading-tight tracking-[-0.03em] text-fg md:text-3xl">{title}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted-fg md:text-lg">{body}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
