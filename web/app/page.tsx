import Navbar from "@/components/layouts/Navbar";
import Grain from "@/components/layouts/Grain";
import Footer from "@/components/layouts/Footer";
import Hero from "@/components/sections/home/Hero";
import Problem from "@/components/sections/home/Problem";
import HowItWorks from "@/components/sections/home/HowItWorks";
import Features from "@/components/sections/home/Features";
import UseCases from "@/components/sections/home/UseCases";
import Roadmap from "@/components/sections/home/Roadmap";
import Waitlist from "@/components/sections/home/Waitlist";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-x-clip">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <UseCases />
        <Roadmap />
        <Waitlist />
      </main>
      <Footer />
      <Grain />
    </>
  );
}
