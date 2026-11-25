import type { ReactNode } from "react";
import Container from "@/components/layouts/Container";
import SectionHeading from "@/components/sections/home/SectionHeading";
import { Card, CodeBlock, Dim, Fn, Kw, Ok, type Accent } from "@/components/sections/home/Panel";

const steps: { step: string; accent: Accent; title: string; body: string; visual: ReactNode }[] = [
  {
    step: "01",
    accent: "pink",
    title: "Write your program in Rust",
    body: "Any SP1 program, built with the standard toolchain. No circuits, no new language — just Rust that reads inputs and commits public outputs.",
    visual: (
      <CodeBlock label="program/src/main.rs">
        <Kw>{"#![no_main]"}</Kw>
        {"\nsp1_zkvm::"}
        <Fn>entrypoint!</Fn>
        {"(main);\n\n"}
        <Kw>pub fn</Kw> <Fn>main</Fn>
        {"() {\n    "}
        <Dim>{"// private input"}</Dim>
        {"\n    "}
        <Kw>let</Kw>
        {" n = sp1_zkvm::io::"}
        <Fn>read</Fn>
        {"::<"}
        <Ok>u32</Ok>
        {">();\n    "}
        <Kw>let</Kw>
        {" (a, b) = "}
        <Fn>fibonacci</Fn>
        {"(n);\n\n    "}
        <Dim>{"// public output, part of the proof"}</Dim>
        {"\n    sp1_zkvm::io::"}
        <Fn>commit</Fn>
        {"(&(n, a, b));\n}"}
      </CodeBlock>
    ),
  },
  {
    step: "02",
    accent: "blue",
    title: "Send it to Orcyn",
    body: "Upload the compiled program and its input with one command or one API call. Choose the proof type; we handle the GPUs, queueing and retries.",
    visual: (
      <CodeBlock label="terminal">
        <Kw>{"$ "}</Kw>
        {"cargo prove build\n"}
        <Kw>{"$ "}</Kw>
        {"orcyn prove "}
        <Fn>--elf</Fn>
        {" program "}
        <Fn>--stdin</Fn>
        {" input.bin \\\n      "}
        <Fn>--mode</Fn>
        {" groth16\n\n"}
        <Ok>{"✓"}</Ok>
        {" request 3f9a2c1e  ·  queued → proving\n"}
        <Ok>{"✓"}</Ok>
        {" fulfilled"}
      </CodeBlock>
    ),
  },
  {
    step: "03",
    accent: "navy",
    title: "Verify anywhere",
    body: "Every proof is verified on our side before you receive it. Check it again off-chain with the SP1 SDK, or on Ethereum through SP1's verifier contracts.",
    visual: (
      <CodeBlock label="contracts/App.sol">
        <Dim>{"// SP1 verifier gateway, deployed by Succinct"}</Dim>
        {"\n"}
        <Kw>ISP1Verifier</Kw>
        {"(verifier)."}
        <Fn>verifyProof</Fn>
        {"(\n    programVKey,   "}
        <Dim>{"// which program"}</Dim>
        {"\n    publicValues,  "}
        <Dim>{"// its outputs"}</Dim>
        {"\n    "}
        <Ok>proofBytes</Ok>
        {"     "}
        <Dim>{"// from orcyn download"}</Dim>
        {"\n);"}
      </CodeBlock>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-16 border-t border-line py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="How it works" titleId="how-title" title="From Rust to a proof on Ethereum." />

        <ol className="mt-14 space-y-6">
          {steps.map(({ step, accent, title, body, visual }) => (
            <li key={step}>
              <Card accent={accent} className="grid grid-cols-12 gap-y-8 p-6 sm:p-10 lg:gap-x-12">
                <div className="col-span-12 min-w-0 lg:col-span-5">
                  <span className="font-mono text-[13px] text-muted-fg">{step}</span>
                  <h3 className="mt-4 text-2xl font-medium leading-tight tracking-[-0.03em] text-fg md:text-3xl">{title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-fg md:text-lg">{body}</p>
                </div>
                <div className="col-span-12 min-w-0 lg:col-span-7">{visual}</div>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
