"use client";

import { HeroSection } from "../HeroSection";
import { ServicesSection } from "../ServicesSection";
import { PopularTours } from "../PopularTours";
import { TestimonialsSection } from "../TestimonialsSection";
import { FlowSection } from "../FlowSection";
import { FAQSection } from "../FAQSection";
import { AccessSection } from "../AccessSection";
import { useRouter } from "../../lib/next-mock";

export default function LandingPage() {
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    router.push(`/tours/${planId}`);
  };

  return (
    <>
      <HeroSection />
      <PopularTours 
        onPlanSelect={handlePlanSelect} 
      />
      <ServicesSection />
      <AccessSection />
      <TestimonialsSection />
      <FlowSection />
      <FAQSection />
    </>
  );
}
