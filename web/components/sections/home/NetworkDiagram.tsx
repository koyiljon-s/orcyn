/** Line art: one coordinator connected to six provers. Decorative SVG, no JavaScript. */

const NAVY = "var(--orcyn-text)";
const BLUE = "var(--orcyn-blue)";
const PINK = "var(--orcyn-pink)";

const SIZE = 56;
const provers = [
  { x: 28, y: 32, color: BLUE, path: "M84 60H137V175H190" },
  { x: 28, y: 172, color: NAVY, path: "M84 200H190" },
  { x: 28, y: 312, color: BLUE, path: "M84 340H137V225H190" },
  { x: 396, y: 32, color: PINK, path: "M396 60H343V175H290" },
  { x: 396, y: 172, color: NAVY, path: "M396 200H290" },
  { x: 396, y: 312, color: BLUE, path: "M396 340H343V225H290" },
];

export default function NetworkDiagram() {
  return (
    <div className="max-w-[520px]">
      <span className="inline-block border border-b-0 border-line px-3 py-1.5 font-mono text-xs text-muted-fg">
        network
      </span>
      <div className="border border-line p-5 sm:p-8">
        <svg viewBox="0 0 480 400" role="img" aria-label="A coordinator connected to six provers" className="block h-auto w-full">
          <g fill="none" strokeWidth="2.5">
            {provers.map(({ path, color }) => (
              <path key={path} d={path} stroke={color} />
            ))}
            {provers.map(({ x, y, color }) => (
              <g key={`${x}-${y}`} stroke={color}>
                <rect x={x} y={y} width={SIZE} height={SIZE} fill="var(--orcyn-bg)" />
                <rect x={x + 18} y={y + 18} width="20" height="20" />
              </g>
            ))}
            <rect x="190" y="150" width="100" height="100" fill="var(--orcyn-bg)" stroke={NAVY} strokeWidth="3" />
            <rect x="210" y="170" width="60" height="60" stroke={NAVY} />
            <rect x="230" y="190" width="20" height="20" stroke={PINK} />
          </g>
          <g aria-hidden="true" className="fill-muted-fg font-mono" fontSize="15" textAnchor="middle">
            <text x="240" y="276">coordinator</text>
            {provers.map(({ x, y }) => (
              <text key={`${x}-${y}`} x={x + SIZE / 2} y={y + SIZE + 22}>
                prover
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
