import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";

const useCases = [
  { title: "Rollups & L2s", body: "Prove state transitions and settle on Ethereum with a single Groth16 or Plonk proof." },
  { title: "Bridges & light clients", body: "Prove another chain's consensus instead of trusting a multisig." },
  { title: "Coprocessors", body: "Run heavy computation off-chain and bring a proof of the result back on-chain." },
  { title: "Verifiable compute & zkML", body: "Prove that a specific program or model produced a result, without re-running it." },
];

export default function UseCases() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-title"
      className="tone-sky relative overflow-hidden bg-page py-24 text-fg md:py-36"
      style={{ backgroundImage: "linear-gradient(#064f86, #0a69ad 60%, #2c86c6)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-72 blur-2xl" style={{ backgroundImage: "radial-gradient(22% 70% at 12% 100%, rgb(255 255 255 / 0.85), transparent), radial-gradient(26% 90% at 38% 110%, rgb(255 255 255 / 0.8), transparent), radial-gradient(24% 75% at 66% 105%, rgb(255 255 255 / 0.85), transparent), radial-gradient(26% 95% at 92% 108%, rgb(255 255 255 / 0.8), transparent)" }} />
      <Container className="relative">
        <SectionHeading titleId="use-title" eyebrow="Use cases" title="If it compiles to SP1, Orcyn proves it.">
          For teams shipping provable software on Ethereum and beyond.
        </SectionHeading>
        <ul className="mt-16 grid gap-4 sm:grid-cols-2">
          {useCases.map(({ title, body }, i) => (
            <li key={title} className="border border-white/60 bg-[#04365e]/90 p-7 sm:p-9">
              <span className="text-[13px] text-muted-fg">0{i + 1}</span>
              <h3 className="mt-8 text-2xl font-normal tracking-[-0.04em] text-white md:text-3xl">{title}</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-muted-fg">{body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
