import Container from "@/components/layouts/Container";
import { Spec } from "@/components/sections/home/Panel";
import SectionHeading from "@/components/sections/home/SectionHeading";
import Terminal from "@/components/sections/home/Terminal";

// Figures from SP1's published hardware requirements (docs.succinct.xyz).
const stats = [
  { value: "24 GB+", label: "GPU memory SP1 recommends for core and compressed STARK proofs" },
  { value: "40 GB+", label: "GPU memory for the Groth16 / Plonk wrap that Ethereum verification needs" },
  { value: "0", label: "GPUs, drivers or proving queues you run with Orcyn" },
];

export default function Problem() {
  return (
    <section aria-labelledby="problem-title" className="relative bg-page py-24 text-fg md:py-36">
      <Container className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="min-w-0">
          <SectionHeading titleId="problem-title" eyebrow="The problem" title="Writing ZK programs got easy. Proving them didn't.">
            zkVMs like SP1 let you write provable programs in plain Rust. Generating the proofs still
            takes expensive hardware, CUDA drivers, job queues and retries — infrastructure every
            team rebuilds on its own.
          </SectionHeading>
          <div className="mt-10 space-y-2.5">
            {stats.map(({ value, label }, i) => (
              <Spec key={value} label={value} value={label} hot={i === 2} />
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-fg">GPU figures: SP1 hardware requirements, Succinct documentation.</p>
        </div>
        <div className="tone-night flex min-w-0 items-center">
          <div className="w-full bg-[linear-gradient(#05080d_35%,#5b6472)] p-4 sm:p-8 lg:py-20">
            <Terminal />
          </div>
        </div>
      </Container>
    </section>
  );
}
