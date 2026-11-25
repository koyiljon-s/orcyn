import { Boxes, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import Container from "@/components/layouts/Container";
import { Spec } from "@/components/sections/home/Panel";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { jobStates, proofModes } from "@/lib/content";

const smallFeatures = [
  {
    icon: RefreshCw,
    title: "Fault-tolerant",
    body: "Jobs hold leases kept alive by heartbeats. If a prover crashes, the job is reassigned automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Verified before delivery",
    body: "Programs are executed before proving and every proof is verified before you get it.",
  },
  {
    icon: Boxes,
    title: "Fast on repeat",
    body: "Programs are stored by content hash and proving keys are cached across requests.",
  },
  {
    icon: KeyRound,
    title: "API and CLI",
    body: "API keys, a small REST API and the orcyn CLI. Scriptable in CI.",
  },
];

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="tone-night relative bg-page py-24 text-fg md:py-36">
      <Container>
        <SectionHeading titleId="features-title" eyebrow="Features" title="Proving infrastructure you don't have to run." />
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <h3 className="text-2xl font-normal tracking-[-0.04em] text-fg">Live job status</h3>
            <p className="mt-2 text-[17px] leading-relaxed text-muted-fg">
              Follow every request from queued to fulfilled, including which prover has it.
            </p>
            <div className="mt-7 space-y-2.5">
              {jobStates.map(({ name, detail }, i) => (
                <Spec key={name} label={name} value={detail} hot={i === jobStates.length - 1} />
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-normal tracking-[-0.04em] text-fg">Every SP1 proof type</h3>
            <p className="mt-2 text-[17px] leading-relaxed text-muted-fg">
              STARKs for speed and recursion, SNARKs for cheap verification on Ethereum.
            </p>
            <div className="mt-7 space-y-2.5">
              {proofModes.map(({ name, detail, selected }) => (
                <Spec key={name} label={name} value={detail} hot={selected} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {smallFeatures.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="size-5 text-[#8fc4ff]" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-normal tracking-[-0.03em] text-fg">{title}</h3>
              <p className="mt-1.5 text-base leading-relaxed text-muted-fg">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
