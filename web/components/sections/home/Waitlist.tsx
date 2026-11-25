import Container from "@/components/layouts/Container";
import { SectionLabel } from "@/components/sections/home/SectionHeading";
import WaitlistForm from "@/components/sections/home/WaitlistForm";

export default function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="scroll-mt-16 border-t border-line py-24 md:py-32">
      <Container className="grid grid-cols-12 items-end gap-y-10 lg:gap-x-12">
        <div className="col-span-12 min-w-0 lg:col-span-7">
          <SectionLabel>Early access</SectionLabel>
          <h2
            id="waitlist-title"
            className="mt-6 text-[clamp(2.25rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg"
          >
            Building on SP1?
            <br />
            Prove with us.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-fg">
            We&apos;re onboarding a small group of design partners. Join the list and we&apos;ll reach
            out with access to the proving API.
          </p>
        </div>
        <div className="col-span-12 min-w-0 lg:col-span-5">
          <WaitlistForm source="footer-cta" />
        </div>
      </Container>
    </section>
  );
}
