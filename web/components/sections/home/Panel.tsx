import type { ReactNode } from "react";

/** Outlined uppercase tag, on pale backgrounds. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex border border-[#0055b8] px-3 py-1 text-[13px] uppercase tracking-[0.01em] text-[#0055b8]">{children}</span>;
}

/** LABEL | value bar. */
export function Spec({ label, value, hot = false }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className="flex border border-fg text-[15px]">
      <span className={`flex w-28 shrink-0 items-center border-r border-fg px-3 py-2 uppercase sm:w-36 ${hot ? "bg-pink text-[#00050a]" : ""}`}>{label}</span>
      <span className="min-w-0 px-3 py-2 text-muted-fg">{value}</span>
    </div>
  );
}

/** Dark code panel with a small filename/language label. */
export function CodeBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="h-full min-w-0 bg-ink">
      <div className="border-b border-white/15 px-5 py-3 font-mono text-xs text-subtle">{label}</div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-white sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/** Hand-written syntax colors for code on dark. */
type Props = { children: ReactNode };
export const Dim = ({ children }: Props) => <span className="text-subtle">{children}</span>;
export const Kw = ({ children }: Props) => <span className="text-pink">{children}</span>;
export const Fn = ({ children }: Props) => <span className="text-sky">{children}</span>;
export const Ok = ({ children }: Props) => <span className="text-lime">{children}</span>;
