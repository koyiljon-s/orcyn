import type { ReactNode } from "react";

const accents = { pink: "bg-pink", blue: "bg-sky", navy: "bg-fg" } as const;
export type Accent = keyof typeof accents;

/** White, square, thin-bordered card. Optional 5px accent bar on top. */
export function Card({
  children,
  accent,
  className = "",
}: {
  children: ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <div className="relative h-full min-w-0 border border-line bg-page">
      {accent && <span aria-hidden="true" className={`absolute -inset-x-px -top-px h-[5px] ${accents[accent]}`} />}
      <div className={`h-full ${className}`}>{children}</div>
    </div>
  );
}

/** Navy code panel with a small filename/language label. */
export function CodeBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 bg-fg">
      <div className="border-b border-white/15 px-5 py-3 font-mono text-xs text-subtle">{label}</div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-white sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/** Hand-written syntax colors for code on navy. */
type Props = { children: ReactNode };
export const Dim = ({ children }: Props) => <span className="text-subtle">{children}</span>;
export const Kw = ({ children }: Props) => <span className="text-pink">{children}</span>;
export const Fn = ({ children }: Props) => <span className="text-sky">{children}</span>;
export const Ok = ({ children }: Props) => <span className="text-lime">{children}</span>;
