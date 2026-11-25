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
    <section aria-labelledby="problem-title" className="border-t border-line py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="The problem" titleId="problem-title" title="Writing ZK programs got easy. Proving them didn't.">
          zkVMs like SP1 let you write provable programs in plain Rust. Generating the proofs still
          takes expensive hardware, CUDA drivers, job queues and retries — infrastructure every
          team rebuilds on its own.
        </SectionHeading>

        <dl className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
          {stats.map(({ value, label }) => (
            <div key={value} className="flex flex-col bg-page p-8 md:p-10">
              <dt className="order-2 mt-5 max-w-xs text-base leading-relaxed text-muted-fg">{label}</dt>
              <dd className="order-1 text-[clamp(3rem,5.4vw,4.5rem)] font-medium leading-none tracking-[-0.03em] text-fg">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted-fg">GPU figures: SP1 hardware requirements, Succinct documentation.</p>
      </Container>
    </section>
  );
}
