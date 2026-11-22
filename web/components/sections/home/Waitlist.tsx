import Container from "@/components/layouts/Container";
import WaitlistForm from "@/components/sections/home/WaitlistForm";

export default function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="bg-page scroll-mt-20 py-24 md:py-40">
      <Container>
        <h2
          id="waitlist-title"
          className="max-w-5xl text-[clamp(2.75rem,8vw,7rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-fg"
        >
          Building on SP1?
          <br />
          Prove with us.
        </h2>
        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          <p className="max-w-xl text-lg leading-relaxed text-subtle md:text-xl">
            We&apos;re onboarding a small group of design partners. Join the list and we&apos;ll reach
            out with access to the proving API.
          </p>
          <div className="w-full lg:w-[440px]">
            <WaitlistForm source="footer-cta" />
          </div>
        </div>
      </Container>
    </section>
  );
}
