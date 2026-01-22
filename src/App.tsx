"use client";

import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { TranslationProvider } from "./lib/i18n/TranslationContext";
import { RouterProvider, useRouter, usePathname } from "./lib/next-mock";

// Page Components
import LandingPage from "./components/pages/LandingPage";
import BookingPage from "./components/pages/BookingPage";
import TourDetailPage from "./components/pages/TourDetailPage";
import MyPagePage from "./components/pages/MyPagePage";
import LoginPage from "./components/pages/LoginPage";
import StaticPage from "./components/pages/StaticPage";

function Layout({ 
  children, 
  isLoggedIn, 
  onLoginClick 
}: { 
  children: React.ReactNode;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Handle navigation from Header/Footer
  const handleNavigate = (target: string) => {
    // Handle anchor links on homepage
    if (['plans', 'flow', 'faq', 'access'].includes(target)) {
      if (pathname !== '/') {
         router.push('/');
         setTimeout(() => {
             const el = document.getElementById(target);
             if (el) el.scrollIntoView({ behavior: 'smooth' });
         }, 100);
      } else {
         const el = document.getElementById(target);
         if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Handle page routes
    const routeMap: Record<string, string> = {
      'home': '/',
      'company': '/company',
      'terms': '/terms',
      'privacy': '/privacy',
      'legal': '/legal',
      'mypage': '/mypage'
    };

    if (routeMap[target]) {
      router.push(routeMap[target]);
    } else {
      // Direct path or unknown
      router.push(target);
    }
  };

  const handleLogoClick = () => {
      router.push('/');
  };

  const isBookingPage = pathname.startsWith('/booking');
  const isLoginPage = pathname === '/login';

  // Do not show header/footer on Booking page or Login page if preferred, 
  // but let's keep header on Login for navigation back
  if (isBookingPage) {
      return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden flex flex-col">
      <Header 
        onNavigate={handleNavigate} 
        onLoginClick={onLoginClick}
        onLogoClick={handleLogoClick}
        isLoggedIn={isLoggedIn}
        alwaysVisible={pathname !== '/'} // Always show header background on non-home pages
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

function AppContent({ 
  isLoggedIn, 
  setIsLoggedIn 
}: { 
  isLoggedIn: boolean; 
  setIsLoggedIn: (val: boolean) => void 
}) {
  const pathname = usePathname();

  if (pathname === '/') {
    return <LandingPage />;
  }

  if (pathname.startsWith('/booking')) {
    return <BookingPage />;
  }

  if (pathname.startsWith('/tours/')) {
    const planId = pathname.split('/')[2];
    return <TourDetailPage planId={planId} />;
  }

  if (pathname === '/login') {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (pathname === '/mypage') {
    return <MyPagePage />;
  }

  if (pathname === '/company') return <StaticPage type="company" />;
  if (pathname === '/terms') return <StaticPage type="terms" />;
  if (pathname === '/privacy') return <StaticPage type="privacy" />;
  if (pathname === '/legal') return <StaticPage type="legal" />;

  return <div className="pt-32 text-center min-h-[50vh]">404 - Page Not Found</div>;
}

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // In a real app, this would be inside the RouterProvider to use useRouter
  // But our mock setup allows this pattern or we can handle it inside AppContent
  
  return (
    <TranslationProvider>
      <RouterProvider>
        {/* We need a child component to use useRouter hooks for onLoginClick */}
        <AppWithRouter isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      </RouterProvider>
    </TranslationProvider>
  );
}

function AppWithRouter({ 
  isLoggedIn, 
  setIsLoggedIn 
}: { 
  isLoggedIn: boolean; 
  setIsLoggedIn: (val: boolean) => void 
}) {
  const router = useRouter();

  const handleLoginClick = () => {
    if (isLoggedIn) {
      router.push('/mypage');
    } else {
      router.push('/login');
    }
  };

  return (
    <Layout isLoggedIn={isLoggedIn} onLoginClick={handleLoginClick}>
      <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Layout>
  );
}
