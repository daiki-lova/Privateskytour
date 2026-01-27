"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, ArrowUp } from "lucide-react";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import logoImageData from "../../assets/logo-footer.png";
import { useBrandInfo } from "@/lib/api/hooks/usePublicSettings";

export function Footer() {
  const { data: brandInfo } = useBrandInfo();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { name: "プラン一覧", id: "plans" },
    { name: "ご利用の流れ", id: "flow" },
    { name: "よくあるご質問", id: "faq" },
    { name: "ヘリポート", id: "access" }
  ];

  const legalLinks = [
    { name: "運営会社", href: "/company" },
    { name: "プライバシーポリシー", href: "/privacy" },
    { name: "特定商取引法に基づく表記", href: "/legal" },
    { name: "利用規約", href: "/terms" },
    { name: "お問い合わせ", href: "/contact" }
  ];

  const socialIcons = [
    { icon: <Instagram className="h-5 w-5" />, href: "#" },
    { icon: <Twitter className="h-5 w-5" />, href: "#" },
    { icon: <Facebook className="h-5 w-5" />, href: "#" },
    { icon: <Youtube className="h-5 w-5" />, href: "#" }
  ];

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 著作権表示の年を計算
  const currentYear = new Date().getFullYear();
  const startYear = brandInfo?.copyright_year_start ?? 2024;
  const yearDisplay = currentYear > startYear ? `${startYear}-${currentYear}` : `${currentYear}`;
  const copyrightHolder = brandInfo?.copyright_holder ?? "株式会社PrivateSky";

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
              {brandInfo?.tagline_ja ?? "上質な空の旅を、あなたに。"}<br />
              特別な日の思い出作りをお手伝いします。
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-full hover:bg-slate-700"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-6 text-sm tracking-wider uppercase">Menu</h4>
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
            <h4 className="font-bold text-white mb-6 text-sm tracking-wider uppercase">Information</h4>
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
                ※天候状況等により運航できない場合がございます。<br />
                ※フライト時間は目安であり、当日の風向き等により多少前後する場合がございます。
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
          <p>&copy; {yearDisplay} {copyrightHolder}. All rights reserved.</p>
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
