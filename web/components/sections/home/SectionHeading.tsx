import type { ReactNode } from "react";

/** Small uppercase label, large tight headline, optional intro. */
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
    <div className="max-w-3xl">
      <p className="text-[13px] uppercase text-muted-fg">{eyebrow}</p>
      <h2 id={titleId} className="mt-5 text-balance text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.03] tracking-[-0.055em] text-fg">
        {title}
      </h2>
      {children && <p className="mt-6 max-w-2xl text-lg leading-relaxed tracking-[-0.01em] text-muted-fg">{children}</p>}
    </div>
  );
}
