import type { ReactNode } from "react";

/** Small label + very large headline + optional intro, used at the top of each section. */
export default function SectionHeading({
  eyebrow,
  title,
  titleId,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  titleId?: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-4xl">
      <p className="text-base font-medium text-subtle">{eyebrow}</p>
      <h2
        id={titleId}
        className="mt-4 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg"
      >
        {title}
      </h2>
      {children && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-subtle md:text-xl">{children}</p>}
    </div>
  );
}
