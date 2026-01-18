import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPsicologosDestaque } from "./catalogo/actions";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { MatchChoice } from "@/components/home/MatchChoice";
import { ProfessionalsCarousel } from "@/components/home/ProfessionalsCarousel";
import { Plans } from "@/components/home/Plans";

export default async function Home() {
  const professionals = await getPsicologosDestaque();

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden font-sans bg-mist">
      <Navbar />
      <Hero />
      <HowItWorks />
      <MatchChoice />
      <ProfessionalsCarousel professionals={professionals} />
      <Plans />
      <Footer /> 
    </main>
  );
}