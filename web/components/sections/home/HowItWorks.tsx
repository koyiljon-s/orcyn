import type { ReactNode } from "react";
import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { CodeBlock, Dim, Ok, Panel } from "@/components/sections/home/Panel";

const steps: { step: string; title: string; body: string; visual: ReactNode }[] = [
  {
    step: "01",
    title: "Write your program in Rust",
    body: "Any SP1 program, built with the standard toolchain. No circuits, no new language — just Rust that reads inputs and commits public outputs.",
    visual: (
      <CodeBlock label="program/src/main.rs">
        {"#![no_main]\nsp1_zkvm::entrypoint!(main);\n\npub fn main() {\n    "}
        <Dim>{"// private input"}</Dim>
        {"\n    let n = sp1_zkvm::io::read::<u32>();\n    let (a, b) = fibonacci(n);\n\n    "}
        <Dim>{"// public output, part of the proof"}</Dim>
        {"\n    sp1_zkvm::io::commit(&(n, a, b));\n}"}
      </CodeBlock>
    ),
  },
  {
    step: "02",
    title: "Send it to Orcyn",
    body: "Upload the compiled program and its input with one command or one API call. Choose the proof type; we handle the GPUs, queueing and retries.",
    visual: (
      <CodeBlock label="terminal">
        <Dim>{"$ "}</Dim>
        {"cargo prove build\n"}
        <Dim>{"$ "}</Dim>
        {"orcyn prove --elf program --stdin input.bin \\\n      --mode groth16\n\n"}
        <Ok>{"✓"}</Ok>
        {" request 3f9a2c1e  ·  queued → proving\n"}
        <Ok>{"✓"}</Ok>
        {" fulfilled"}
      </CodeBlock>
    ),
  },
  {
    step: "03",
    title: "Verify anywhere",
    body: "Every proof is verified on our side before you receive it. Check it again off-chain with the SP1 SDK, or on Ethereum through SP1's verifier contracts.",
    visual: (
      <CodeBlock label="contracts/App.sol">
        <Dim>{"// SP1 verifier gateway, deployed by Succinct"}</Dim>
        {"\nISP1Verifier(verifier).verifyProof(\n    programVKey,   "}
        <Dim>{"// which program"}</Dim>
        {"\n    publicValues,  "}
        <Dim>{"// its outputs"}</Dim>
        {"\n    proofBytes     "}
        <Dim>{"// from orcyn download"}</Dim>
        {"\n);"}
      </CodeBlock>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-page scroll-mt-20 py-24 md:py-36">
      <Container>
        <SectionHeading eyebrow="How it works" titleId="how-title" title="From Rust to a proof on Ethereum." />

        <ol aria-labelledby="how-title" className="mt-16 space-y-6">
          {steps.map(({ step, title, body, visual }, i) => (
            <li key={step}>
              <Panel className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
                {/* Alternate text/visual sides on large screens */}
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <span className="font-mono text-sm text-subtle">{step}</span>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-fg md:text-4xl">
                    {title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-subtle">{body}</p>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>{visual}</div>
              </Panel>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
