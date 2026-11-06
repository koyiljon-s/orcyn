export default function Hero() {
  return (
    <section className="py-48 bg-[#02090a]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white flex flex-col text-5xl md:text-6xl font-base tracking-[-0.04em] leading-[1.05] pt-16 md:pt-24 pb-6">
          Prove computation
          <span>
             without revealing
            <span className="italic text-[#36f5a2]"> secrets</span>
          </span>
        </h1>
        <p className="text-[#72727a] text-lg md:text-2xl font-medium leading-[1.6] max-w-2xl pb-16 md:pb-24">
         Decentralized ZK Proof Network for Software
        </p>
      </div>
    </section>
  );
}
