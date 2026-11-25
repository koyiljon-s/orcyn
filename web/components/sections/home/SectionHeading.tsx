import type { ReactNode } from "react";

/** Mono tag on a gray chip, followed by a pink ">". */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[13px] text-fg">
      <span className="bg-chip px-2.5 py-1 capitalize">{children}</span>
      <span aria-hidden="true" className="text-base font-medium leading-none text-pink">
        &gt;
      </span>
    </p>
  );
}

/** Label + headline + optional intro, used at the top of each section. */
export default function SectionHeading({
  eyebrow,
  title,
  titleId,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  titleId: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12 lg:col-span-8">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h2
          id={titleId}
          className="mt-6 text-balance text-[clamp(2rem,4.2vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.03em] text-fg"
        >
          {title}
        </h2>
        {children && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-fg">{children}</p>}
      </div>
    </div>
  );
}
