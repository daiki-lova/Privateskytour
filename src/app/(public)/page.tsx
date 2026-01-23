import { HeroSection } from '@/components/public/HeroSection';
import { PopularTours } from '@/components/public/PopularTours';
import { ServicesSection } from '@/components/public/ServicesSection';
import { AccessSection } from '@/components/public/AccessSection';
import { FlowSection } from '@/components/public/FlowSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { FAQSection } from '@/components/public/FAQSection';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PopularTours />
      <ServicesSection />
      <AccessSection />
      <TestimonialsSection />
      <FlowSection />
      <FAQSection />
    </>
  );
}
