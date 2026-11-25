/** Pale planet with a glowing blue edge. Set its height with [--planet:...]. Decorative. */
export default function Planet({ className }: { className: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute left-1/2 aspect-square w-[max(2600px,200vw)] -translate-x-1/2 rounded-[50%]"
        style={{
          top: "calc(100% - var(--planet))",
          backgroundImage: "linear-gradient(#cfcfcd, #dad9d6 14%)",
          boxShadow: "0 -3px 14px 4px rgb(120 180 240 / 0.9), 0 -10px 60px 8px rgb(40 120 220 / 0.55), inset 0 14px 40px rgb(90 160 235 / 0.55)",
        }}
      />
    </div>
  );
}
