import Container from "@/components/layouts/Container";
import { Monolith } from "@/components/sections/home/Monolith";
import { Tag } from "@/components/sections/home/Panel";
import Planet from "@/components/sections/home/Planet";
import WaitlistForm from "@/components/sections/home/WaitlistForm";
import { proofModes } from "@/lib/content";

export default function Hero() {
  return (
    <section className="tone-night relative bg-page text-fg">
      <Planet className="[--planet:540px] lg:[--planet:430px]" />

      <Container className="relative pb-14 pt-28 md:pt-32">
        <h1 className="text-[clamp(2.75rem,8.4vw,7.5rem)] font-light leading-[0.95] tracking-[-0.06em] text-[#d6eaff]">
          Zero-knowledge
          <span className="block md:text-right">proofs, on demand.</span>
        </h1>
        <Monolith className="mx-auto mt-2 w-[min(300px,70vw)] md:mt-3 md:w-[350px]" />

        <div className="tone-pale grid items-end gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <p className="max-w-xl text-lg leading-snug tracking-[-0.02em] text-fg md:text-[22px]">
              Send an SP1 program and its input. Get back a verified proof — core, compressed,
              Groth16 or Plonk — without running a GPU cluster.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {proofModes.map(({ name }) => (
                <Tag key={name}>{name}</Tag>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <WaitlistForm source="hero" />
            <a href="#how-it-works" className="mt-3 inline-flex min-h-11 items-center gap-2 text-[15px] uppercase text-link underline-offset-4 hover:underline">
              See how it works <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
