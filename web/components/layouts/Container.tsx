import type { ReactNode } from "react";

/** Same width and side padding everywhere (1200px of content on large screens). */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1264px] px-5 sm:px-8 ${className}`}>{children}</div>;
}
