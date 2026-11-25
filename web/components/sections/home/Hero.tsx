import Container from "@/components/layouts/Container";
import NetworkDiagram from "@/components/sections/home/NetworkDiagram";
import { SectionLabel } from "@/components/sections/home/SectionHeading";
import Terminal from "@/components/sections/home/Terminal";
import WaitlistForm from "@/components/sections/home/WaitlistForm";
import { buttonSecondary } from "@/lib/styles";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32">
      <Container className="grid grid-cols-12 items-center gap-y-14 lg:gap-x-12">
        <div className="col-span-12 min-w-0 lg:col-span-7">
          <SectionLabel>Early access · SP1 proving API</SectionLabel>
          <h1 className="mt-7 text-[clamp(2.5rem,5.6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-fg">
            Zero-knowledge proofs, on demand.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-fg md:text-xl">
            Send an SP1 program and its input. Get back a verified proof — core, compressed,
            Groth16 or Plonk — without running a GPU cluster.
          </p>
          <div className="mt-9 max-w-xl">
            <WaitlistForm source="hero" />
          </div>
          <a href="#how-it-works" className={`mt-4 ${buttonSecondary}`}>
            See how it works <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="col-span-12 min-w-0 lg:col-span-5">
          <NetworkDiagram />
        </div>
      </Container>

      <Container className="mt-20 md:mt-28">
        <Terminal />
      </Container>
    </section>
  );
}
