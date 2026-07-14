import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceSection from "@/components/ServiceSection";
import TechSection from "@/components/TechSection";

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSection />
        <AboutSection />
        <ServiceSection />
        <TechSection />
      </main>

      <Footer />
    </>
  );
}