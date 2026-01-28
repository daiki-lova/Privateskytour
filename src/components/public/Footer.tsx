"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import logoImageData from "../../assets/logo-footer.png";
import { useBrandInfo } from "@/lib/api/hooks/usePublicSettings";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export function Footer() {
  const { data: brandInfo } = useBrandInfo();
  const { t, language } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { name: t('navigation.plans'), id: "plans" },
    { name: t('navigation.flow'), id: "flow" },
    { name: t('navigation.faq'), id: "faq" },
    { name: t('navigation.access'), id: "access" }
  ];

  const legalLinks = [
    { name: t('navigation.company'), href: "/company" },
    { name: t('navigation.privacy'), href: "/privacy" },
    { name: t('navigation.legal'), href: "/legal" },
    { name: t('navigation.terms'), href: "/terms" },
    { name: t('navigation.contact'), href: "/contact" }
  ];

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 著作権表示の年を計算
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden pt-16 pb-8">
      <div className="w-[90%] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo & About */}
          <div className="col-span-1 lg:col-span-1">
            <div
              className="cursor-pointer inline-block mb-6"
              onClick={scrollToTop}
            >
              <ImageWithFallback
                src={logoImageData.src}
                alt={brandInfo?.service_name ?? "PRIVATESKY TOUR"}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {(language === 'en' ? brandInfo?.tagline_en : brandInfo?.tagline_ja) || t('hero.tagline')}<br />
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-6 text-sm tracking-wider uppercase">{t('navigation.menu')}</h4>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleScrollToSection(link.id)}
                    className="text-slate-400 hover:text-white transition-colors text-sm text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-white mb-6 text-sm tracking-wider uppercase">{t('navigation.information')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-400 hover:text-white transition-colors text-sm block text-left"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800">
              <p className="text-slate-500 text-xs leading-relaxed">
                {language === 'ja' && (
                  <>
                    ※天候状況等により運航できない場合がございます。<br />
                    ※フライト時間は目安であり、当日の風向き等により多少前後する場合がございます。
                  </>
                )}
                {language === 'en' && (
                  <>
                    *Flights may be cancelled due to weather conditions.<br />
                    *Flight times are estimates and may vary depending on wind conditions.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
          <p className="tracking-widest font-medium uppercase">&copy;{currentYear} PrivateSky. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800 h-auto py-2"
            >
              Page Top <ArrowUp className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
