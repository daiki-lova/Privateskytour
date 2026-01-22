import React from "react";
import { Button } from "./button";
import { useTranslation } from "../../lib/i18n/TranslationContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  isDark?: boolean;
}

export function LanguageSwitcher({ isDark = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className={`gap-2 px-3 h-9 rounded-full transition-all duration-300 border ${
        isDark 
          ? "text-slate-700 border-slate-200 hover:text-vivid-blue hover:bg-vivid-blue/5" 
          : "text-white border-white/20 hover:text-white hover:bg-white/10"
      }`}
    >
      <Globe className="h-3.5 w-3.5" />
      <div className="flex items-center text-[10px] font-bold tracking-widest uppercase">
        <span className={language === 'ja' ? "text-vivid-blue" : "opacity-50"}>JP</span>
        <span className="mx-1 opacity-20">/</span>
        <span className={language === 'en' ? "text-vivid-blue" : "opacity-50"}>EN</span>
      </div>
    </Button>
  );
}