/**
 * Animated terminal showing the `orcyn prove` flow.
 *
 * Pure CSS animation (no client JavaScript): every line is in the HTML from
 * the start and fades in after its delay. With "reduce motion" turned on, the
 * animation is skipped and all lines are simply visible.
 */

type Line = { text: string; tone?: "command" | "ok" | "muted" };

const lines: Line[] = [
  { text: "$ orcyn prove --elf fibonacci --stdin stdin.bin --mode groth16", tone: "command" },
  { text: "✓ uploaded program 98 KB  ·  request 3f9a2c1e", tone: "ok" },
  { text: "  status   queued", tone: "muted" },
  { text: "  status   assigned → gpu-worker-1", tone: "muted" },
  { text: "  status   proving  ·  9,596 cycles", tone: "muted" },
  { text: "✓ fulfilled  ·  proof verified by worker", tone: "ok" },
  { text: "$ orcyn download 3f9a2c1e -o proof.bin", tone: "command" },
  { text: "✓ saved proof.bin  ·  ready for on-chain verification", tone: "ok" },
];

function LineText({ line }: { line: Line }) {
  if (line.tone === "ok") {
    // Accent only on the checkmark; the rest stays white.
    return (
      <>
        <span className="text-lime">✓</span>
        <span className="text-white">{line.text.slice(1)}</span>
      </>
    );
  }
  if (line.tone === "command") {
    // "$ orcyn prove --flag value": pink prompt, blue flags.
    return (
      <>
        {line.text.split(/(^\$|\s-{1,2}[a-z]+)/).map((part, i) => {
          const tone = part === "$" ? "text-pink" : /^\s-/.test(part) ? "text-sky" : "text-white";
          return (
            <span key={i} className={tone}>
              {part}
            </span>
          );
        })}
      </>
    );
  }
  return <span className="text-subtle">{line.text}</span>;
}

export default function Terminal() {
  return (
    <figure className="w-full overflow-hidden bg-night">
      <div className="flex items-center gap-2 border-b border-white/15 px-5 py-4" aria-hidden="true">
        <span className="size-2.5 bg-white/25" />
        <span className="size-2.5 bg-white/25" />
        <span className="size-2.5 bg-white/25" />
        <span className="ml-3 font-mono text-xs text-subtle">orcyn — zsh</span>
      </div>

      <pre className="overflow-x-auto whitespace-pre-wrap px-5 py-6 font-mono text-[13px] leading-7 sm:whitespace-pre sm:leading-8 sm:px-8 sm:py-8 sm:text-base">
        <code>
          {lines.map((line, i) => (
            <span
              key={i}
              className="block animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards duration-500 ease-out motion-reduce:animate-none"
              style={{ animationDelay: `${300 + i * 650}ms` }}
            >
              <LineText line={line} />
            </span>
          ))}
        </code>
      </pre>

      <figcaption className="border-t border-white/15 px-5 py-3 font-mono text-xs text-subtle sm:px-8">
        CLI preview · fibonacci example from our test runs
      </figcaption>
    </figure>
  );
}
