"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';

type TranslationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja');

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Sync to localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Nested object lookup for translation keys (e.g., "common.login")
  const t = (path: string, params?: Record<string, string>): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current[key] === undefined) {
        // Translation key not found
        return path;
      }
      current = current[key];
    }

    let text = current as string;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{${key}}`, 'g'), value);
      });
    }

    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
