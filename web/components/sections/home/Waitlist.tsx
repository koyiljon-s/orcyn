import Container from "@/components/layouts/Container";
import Planet from "@/components/sections/home/Planet";
import WaitlistForm from "@/components/sections/home/WaitlistForm";

export default function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="wait-title" className="tone-night relative bg-page pb-16 pt-24 text-fg md:pt-32">
      <Planet className="[--planet:380px] lg:[--planet:340px]" />
      <Container className="relative">
        <h2 id="wait-title" className="text-[clamp(2.75rem,8vw,7rem)] font-light leading-[0.97] tracking-[-0.06em] text-[#d6eaff]">
          Building on SP1?
          <span className="block md:text-right">Prove with us.</span>
        </h2>
        <div className="tone-pale mt-60 grid items-end gap-8 lg:mt-64 lg:grid-cols-2 lg:gap-16">
          <p className="max-w-xl text-lg leading-snug tracking-[-0.02em] text-fg md:text-[22px]">
            We&apos;re onboarding a small group of design partners. Join the list and we&apos;ll reach
            out with access to the proving API.
          </p>
          <div className="min-w-0">
            <WaitlistForm source="footer-cta" />
          </div>
        </div>
      </Container>
    </section>
  );
}
