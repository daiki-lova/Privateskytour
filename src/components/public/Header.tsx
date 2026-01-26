"use client";

import { Button } from "../ui/button";
import { Menu, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/TranslationContext";
import Link from "next/link";
import logoImageData from "../../assets/logo-header.png";

interface HeaderProps {
  isLoggedIn?: boolean;
  alwaysVisible?: boolean;
}

export function Header({ isLoggedIn = false, alwaysVisible = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isVisible = alwaysVisible || isScrolled;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: t("navigation.plans"), id: "plans" },
    { name: t("navigation.flow"), id: "flow" },
    { name: t("navigation.faq"), id: "faq" },
    { name: t("navigation.access"), id: "access" }
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible
            ? "backdrop-blur-lg bg-white/80 shadow-lg border-b border-white/20"
            : "bg-transparent"
          }`}
      >
        <div className="w-[93%] md:w-[90%] mx-auto">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <div className={`h-8 w-auto transition-all duration-300 ${isVisible ? "" : "brightness-0 invert"
                    }`}>
                    <ImageWithFallback
                      src={logoImageData.src}
                      alt="PRIVATESKY TOUR"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-center space-x-6">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-3 py-2 transition-colors duration-300 relative group font-bold tracking-wide ${isVisible
                        ? "text-slate-700 hover:text-vivid-blue"
                        : "text-white/90 hover:text-white"
                      }`}
                  >
                    {item.name}
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-vivid-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </motion.button>
                ))}
              </div>
            </nav>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher isDark={isVisible} />

              <div className="w-[1px] h-6 bg-slate-200/20 mx-1"></div>

              <Link href={isLoggedIn ? "/mypage" : "/login"}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-white text-black hover:bg-slate-100 font-bold rounded-full px-6 shadow-md transition-all duration-300 border border-slate-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {isLoggedIn ? t("common.myPage") : t("common.login")}
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`transition-colors duration-300 ${isVisible
                      ? "text-slate-900 hover:text-[#003366]"
                      : "text-white/90 hover:text-white"
                    }`}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-40 md:hidden"
          >
            <div className="backdrop-blur-lg bg-white/95 shadow-xl border-b border-white/20 px-4 py-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center px-3 mb-4">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{t("navigation.menu")}</span>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher isDark={true} />
                  </div>
                </div>
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 10 }}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left px-3 py-2 text-slate-700 hover:text-[#003366] transition-colors font-bold text-lg"
                  >
                    {item.name}
                  </motion.button>
                ))}
                <div className="border-t pt-6 mt-4 space-y-4">
                  <Link
                    href={isLoggedIn ? "/mypage" : "/login"}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg font-medium text-slate-700 hover:text-[#003366]"
                    >
                      <User className="mr-2 h-5 w-5" />
                      {isLoggedIn ? t("common.myPage") : t("common.login")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
