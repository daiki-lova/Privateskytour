"use client";

import { HeroSection } from "../HeroSection";
import { ServicesSection } from "../ServicesSection";
import { PopularTours } from "../PopularTours";
import { TestimonialsSection } from "../TestimonialsSection";
import { FlowSection } from "../FlowSection";
import { FAQSection } from "../FAQSection";
import { AccessSection } from "../AccessSection";
import { useRouter } from "../../lib/next-mock";

/**
 * Main landing page for SkyView
 */
function SkyViewHomePage() {
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    router.push(`/tours/${planId}`);
  };

  const handleAccessClick = () => {
    const el = document.getElementById('access');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <HeroSection />
      <PopularTours 
        onPlanSelect={handlePlanSelect} 
        onAccessClick={handleAccessClick}
      />
      <ServicesSection />
      <AccessSection />
      <TestimonialsSection />
      <FlowSection />
      <FAQSection />
    </>
  );
}

export default SkyViewHomePage;
