import type { CSSProperties } from "react";

const grain: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.1 -.25'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
  opacity: 0.2,
};

/** Film grain over the whole page. Decorative; never blocks clicks. */
export default function Grain() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30" style={grain} />;
}
