import Container from "@/components/layouts/Container";
import Terminal from "@/components/sections/home/Terminal";
import WaitlistForm from "@/components/sections/home/WaitlistForm";

export default function Hero() {
  return (
    <section className="bg-page pt-32 pb-16 md:pt-40 md:pb-24">
      <Container>
        <p className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-subtle">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
          Early access · SP1 proving API
        </p>

        <h1 className="mt-8 text-[clamp(2.75rem,9vw,8.5rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-fg">
          Zero-knowledge proofs,
          <br />
          on demand.
        </h1>

        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          <p className="max-w-2xl text-lg leading-relaxed text-subtle md:text-2xl md:leading-relaxed">
            Send an SP1 program and its input. Get back a verified proof — core, compressed,
            Groth16 or Plonk — without running a GPU cluster.
          </p>
          <div className="w-full lg:w-[440px]">
            <WaitlistForm source="hero" />
          </div>
        </div>
      </Container>

      <Container className="mt-16 md:mt-20">
        <Terminal />
      </Container>
    </section>
  );
}
