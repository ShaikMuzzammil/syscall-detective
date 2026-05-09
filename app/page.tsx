import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import BentoGrid from "@/components/landing/BentoGrid";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import Testimonials from "@/components/landing/Testimonials";
import ComparisonTable from "@/components/landing/ComparisonTable";
import KernelDiagram from "@/components/landing/KernelDiagram";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <div id="workflow" className="scroll-mt-24">
        <HowItWorks />
      </div>
      <div id="features" className="scroll-mt-24">
        <BentoGrid />
      </div>
      <section id="demo">
        <InteractiveDemo />
      </section>
      <div id="research" className="scroll-mt-24">
        <Testimonials />
      </div>
      <ComparisonTable />
      <KernelDiagram />
      <div id="contact" className="scroll-mt-24">
        <ContactSection />
      </div>
      <Footer />
    </>
  );
}
