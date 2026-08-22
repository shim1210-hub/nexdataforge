import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceSection from "@/components/ServiceSection";
import TechSection from "@/components/TechSection";
import styles from "@/components/home/Home.module.css";

export default function HomePage() {
  return (
    <div className={styles.homeShell}>
      <Header />

      <main className={styles.homeMain}>
        <HeroSection />
        <AboutSection />
        <ServiceSection />
        <TechSection />
      </main>

      <Footer />
    </div>
  );
}
