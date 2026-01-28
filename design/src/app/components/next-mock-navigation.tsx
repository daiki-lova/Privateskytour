"use client";
import { useEffect, useState } from 'react';

// Mock for next/navigation
export const usePathname = () => {
  const [pathname, setPathname] = useState(window.location.hash.replace('#', '') || '/admin/dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      setPathname(window.location.hash.replace('#', '') || '/admin/dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return pathname;
};

export const useRouter = () => {
  return {
    push: (url: string) => {
      window.location.hash = url;
    },
    replace: (url: string) => {
      window.location.hash = url;
    },
    back: () => {
      window.history.back();
    },
  };
};
