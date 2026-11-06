import Navbar from "@/components/layouts/Navbar";
import Hero from "@/components/sections/home/Hero";
import Footer from "@/components/layouts/Footer";

export default function Home() {
  return (
    <>
     <Navbar />
     <main className="flex-1">
      <Hero />
     </main>
     <Footer />
    </>
  );
}