export default function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center py-32 md:py-78">
        <div>
          <h1 className="text-[#1e2026] text-5xl md:text-[82px] font-bold tracking-[-0.04em] leading-[1.05]">
            Authenticate CLI
          </h1>
          <p className="text-[#1e2026] text-lg md:text-[44px] font-semibold leading-[1.6] max-w-xl">
            Generate your access token
          </p>
        </div>
        <div>{/* Right side — intentionally empty for now */}</div>
      </div>
    </section>
  );
}
