import type { ReactNode } from "react";

/** Large rounded panel for product visuals. Follows the section's tone (dark or light). */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-[28px] border border-line bg-panel ${className}`}>{children}</div>;
}

/**
 * Code block with a small filename/language label.
 * Always dark, even inside light sections: code reads best on dark, and a dark
 * product visual on a light section is a strong contrast.
 */
export function CodeBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-code-line bg-code">
      <div className="border-b border-code-line px-5 py-3 font-mono text-xs text-code-dim">{label}</div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-white/90 sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/** Dim comment / check helpers for hand-highlighted code (inside CodeBlock). */
export const Dim = ({ children }: { children: ReactNode }) => <span className="text-code-dim">{children}</span>;
export const Ok = ({ children }: { children: ReactNode }) => <span className="text-brand">{children}</span>;
