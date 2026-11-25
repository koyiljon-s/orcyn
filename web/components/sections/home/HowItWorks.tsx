import type { ReactNode } from "react";
import Container from "@/components/layouts/Container";
import { Blueprint } from "@/components/sections/home/Monolith";
import { CodeBlock, Dim, Fn, Kw, Ok } from "@/components/sections/home/Panel";
import SectionHeading from "@/components/sections/home/SectionHeading";

const steps: { step: string; title: string; body: string; visual: ReactNode }[] = [
  {
    step: "01",
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
    <section id="how-it-works" aria-labelledby="how-title" className="relative overflow-hidden bg-page py-24 text-fg md:py-36">
      <Blueprint className="pointer-events-none absolute -right-40 top-10 w-[900px] max-w-none opacity-25" />
      <Blueprint className="pointer-events-none absolute -left-72 bottom-0 w-[800px] max-w-none opacity-15" />
      <Container className="relative">
        <SectionHeading titleId="how-title" eyebrow="How it works" title="From Rust to a proof on Ethereum." />
        <ol className="mt-16 space-y-6">
          {steps.map(({ step, title, body, visual }) => (
            <li key={step} className="grid border border-fg bg-page/85 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="p-7 sm:p-10">
                <span className="inline-flex border border-fg bg-pink px-2.5 py-0.5 text-[13px] text-[#00050a]">{step}</span>
                <h3 className="mt-6 text-3xl font-normal tracking-[-0.045em] text-fg">{title}</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-muted-fg">{body}</p>
              </div>
              <div className="min-w-0 bg-ink">
                {visual}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
