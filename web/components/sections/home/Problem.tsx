import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";

// Figures from SP1's published hardware requirements (docs.succinct.xyz).
const stats = [
  { value: "24 GB+", label: "GPU memory SP1 recommends for core and compressed STARK proofs" },
  { value: "40 GB+", label: "GPU memory for the Groth16 / Plonk wrap that Ethereum verification needs" },
  { value: "0", label: "GPUs, drivers or proving queues you run with Orcyn" },
];

export default function Problem() {
  return (
    <section aria-labelledby="problem-title" className="tone-light bg-page py-24 md:py-36">
      <Container>
        <SectionHeading eyebrow="The problem" titleId="problem-title" title="Writing ZK programs got easy. Proving them didn't.">
          zkVMs like SP1 let you write provable programs in plain Rust. Generating the proofs still
          takes expensive hardware, CUDA drivers, job queues and retries — infrastructure every
          team rebuilds on its own.
        </SectionHeading>

        <dl className="mt-16 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-3">
          {stats.map(({ value, label }) => (
            <div key={value} className="bg-panel p-8 md:p-10">
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block text-[clamp(3.5rem,7vw,6rem)] font-semibold leading-none tracking-[-0.05em] text-fg">
                  {value}
                </span>
                <span className="mt-5 block max-w-xs text-base leading-relaxed text-subtle">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-subtle">GPU figures: SP1 hardware requirements, Succinct documentation.</p>
      </Container>
    </section>
  );
}
