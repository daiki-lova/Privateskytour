"use client";

import { Button } from "../ui/button";
import { ArrowDown } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import heroImageData from "../../assets/hero-bg.png";
import { useTranslation } from "@/lib/i18n/TranslationContext";

interface HeroSectionProps {
  onViewPlansClick?: () => void;
}

export function HeroSection({ onViewPlansClick }: HeroSectionProps) {
  const { t } = useTranslation();
  const handleScrollToPlans = () => {
    if (onViewPlansClick) {
      onViewPlansClick();
    } else {
      // Default behavior: smooth scroll to plans section
      const element = document.getElementById('plans');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {/* Video background - autoplay, muted, loop for background effect */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={heroImageData.src}
          className="w-full h-full object-cover scale-110 brightness-75"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
          {/* Fallback image if video fails to load */}
          <ImageWithFallback
            src={heroImageData.src}
            alt="Aerial View of Tokyo Skyline with Helicopter"
            className="w-full h-full object-cover scale-110 brightness-75"
          />
        </video>
        <motion.div
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-[93%] md:w-[90%] max-w-7xl mx-auto flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          <h1 className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] mb-6 font-serif tracking-widest text-6xl md:text-7xl lg:text-8xl leading-tight font-light">
            <span className="md:hidden">SKYVIEW<br />TOKYO</span>
            <span className="hidden md:inline">SKYVIEW TOKYO</span>
          </h1>
          <div className="w-24 h-[1px] bg-white mx-auto my-8 opacity-80"></div>
          <p className="text-white/90 text-lg md:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] leading-relaxed max-w-2xl mx-auto font-light tracking-wider whitespace-pre-line">
            {t('hero.tagline')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Button
            onClick={handleScrollToPlans}
            variant="outline"
            className="bg-transparent text-white border-white hover:bg-white hover:text-black transition-all duration-300 px-10 py-6 text-sm tracking-[0.2em] rounded-sm uppercase"
          >
            {t('hero.viewPlans')}
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/70 flex flex-col items-center animate-bounce cursor-pointer"
        onClick={handleScrollToPlans}
      >
        <span className="text-[10px] tracking-[0.3em] mb-2 uppercase">{t('hero.scroll')}</span>
        <ArrowDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
