/** The Orcyn mark as a 3D block, projected to SVG. No images, no JavaScript. */

type P3 = [number, number, number];
const DEPTH = 4;
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
// Rounded so server and client always produce the same markup.
const r = (n: number) => Math.round(n * 100) / 100;
const project = ([x, y, z]: P3) => `${r((x - y) * COS * 20)},${r(((x + y) * SIN - z) * 20)}`;
const poly = (points: P3[]) => points.map(project).join(" ");

// Outline of the mark on the x/z plane (same shape as Logo.tsx), and the node.
const ring: [number, number][] = [[2, 12], [9, 12], [9, 9], [5, 9], [5, 3], [11, 3], [11, 7], [14, 7], [14, 0], [2, 0]];
const node: [number, number][] = [[10, 12], [14, 12], [14, 8], [10, 8]];

const front = (shape: [number, number][]) => poly(shape.map(([x, z]): P3 => [x, DEPTH, z]));
const right = (x: number, z0: number, z1: number) => poly([[x, DEPTH, z0], [x, DEPTH, z1], [x, 0, z1], [x, 0, z0]]);
const top = (z: number, x0: number, x1: number) => poly([[x0, DEPTH, z], [x1, DEPTH, z], [x1, 0, z], [x0, 0, z]]);

const VIEW = "-50 -240 310 440";

export function Monolith({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="m-front" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#3a424d" />
          <stop offset="0.45" stopColor="#12161d" />
          <stop offset="0.62" stopColor="#4a525d" />
          <stop offset="0.75" stopColor="#0c1016" />
          <stop offset="1" stopColor="#06090e" />
        </linearGradient>
        <linearGradient id="m-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f5f6" />
          <stop offset="1" stopColor="#a9adb3" />
        </linearGradient>
        <linearGradient id="m-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8fb4d8" />
          <stop offset="1" stopColor="#e9f2fb" />
        </linearGradient>
        <radialGradient id="m-shadow">
          <stop offset="0" stopColor="#000" stopOpacity="0.5" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="98" cy="150" rx="140" ry="38" fill="url(#m-shadow)" />
      <polygon points={right(5, 3, 9)} fill="url(#m-side)" opacity="0.75" />
      <polygon points={top(3, 5, 11)} fill="url(#m-top)" opacity="0.8" />
      <polygon points={top(12, 2, 9)} fill="url(#m-top)" />
      <polygon points={right(9, 9, 12)} fill="url(#m-side)" />
      <polygon points={top(7, 11, 14)} fill="url(#m-top)" />
      <polygon points={right(14, 0, 7)} fill="url(#m-side)" />
      <polygon points={front(ring)} fill="url(#m-front)" stroke="#9cc7ee" strokeOpacity="0.45" strokeWidth="0.8" />
      <g className="node-float">
        <polygon points={top(12, 10, 14)} fill="#ff8fe3" />
        <polygon points={right(14, 8, 12)} fill="#c4009a" />
        <polygon points={front(node)} fill="#fe11c5" />
      </g>
    </svg>
  );
}

/** Same block as blueprint lines. */
export function Blueprint({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className={className}>
      <g fill="none" stroke="#2f7fd0" strokeWidth="1">
        <polygon points={front(ring)} />
        <polygon points={front(node)} />
        {[right(5, 3, 9), top(3, 5, 11), top(12, 2, 9), right(9, 9, 12), top(7, 11, 14), right(14, 0, 7), top(12, 10, 14), right(14, 8, 12)].map((points) => (
          <polygon key={points} points={points} />
        ))}
      </g>
    </svg>
  );
}
