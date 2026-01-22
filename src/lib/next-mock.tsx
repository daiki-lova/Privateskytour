import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Mocking next/navigation & next/router behavior ---

interface RouterContextType {
  pathname: string;
  push: (path: string) => void;
  query: Record<string, string>;
  back: () => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from window location if possible, but default to root for SPA behavior in preview
  const [pathname, setPathname] = useState('/');
  const [query, setQuery] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>(['/']);

  const push = (path: string) => {
    const [pathPart, queryPart] = path.split('?');
    setPathname(pathPart);
    
    const newQuery: Record<string, string> = {};
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      params.forEach((val, key) => { newQuery[key] = val });
    }
    setQuery(newQuery);
    setHistory(prev => [...prev, path]);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
      if (history.length > 1) {
          const newHistory = [...history];
          newHistory.pop(); // Remove current
          const previousPath = newHistory[newHistory.length - 1];
          setHistory(newHistory);
          
          const [pathPart, queryPart] = previousPath.split('?');
          setPathname(pathPart);
          const newQuery: Record<string, string> = {};
            if (queryPart) {
            const params = new URLSearchParams(queryPart);
            params.forEach((val, key) => { newQuery[key] = val });
            }
            setQuery(newQuery);
      }
  };

  return (
    <RouterContext.Provider value={{ pathname, push, query, back }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter must be used within RouterProvider');
  return context;
};

export const usePathname = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('usePathname must be used within RouterProvider');
  return context.pathname;
};

export const useSearchParams = () => {
    const context = useContext(RouterContext);
    if (!context) throw new Error('useSearchParams must be used within RouterProvider');
    
    // Convert generic object to URLSearchParams-like interface with get method
    const params = new URLSearchParams(context.query);
    return params;
};

// --- Mocking next/link ---

interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export const Link = ({ href, children, className, onClick }: LinkProps) => {
  const router = useContext(RouterContext);
  
  return (
    <a 
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        if (router) router.push(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
};
