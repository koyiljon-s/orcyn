/** Mark (same shape as app/icon.png, without the tile) + wordmark. */
export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-fg">
      <svg viewBox="2 2 12 12" className="size-6 shrink-0" shapeRendering="crispEdges" aria-hidden="true">
        <path fill="currentColor" d="M2 2H9V5H5V11H11V7H14V14H2Z" />
        <rect x="10" y="2" width="4" height="4" className="fill-pink" />
      </svg>
      <span className="text-[26px] font-bold leading-none tracking-[-0.04em]">orcyn</span>
    </span>
  );
}
