'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/lib/data/types';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const responseData = await response.json();
        // API returns { success: true, data: AdminUser } format
        setUser(responseData.data ?? null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch user on mount
    fetchUser();

    // Listen to Supabase auth state changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, _session: Session | null) => {
        // Re-fetch user when auth state changes
        fetchUser();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const responseData = await response.json();

        if (response.ok && responseData.success) {
          // API returns { success: true, data: AdminUser } format
          setUser(responseData.data ?? null);
          return { success: true };
        }

        return {
          success: false,
          error: responseData.error ?? 'Login failed',
        };
      } catch {
        return {
          success: false,
          error: 'An unexpected error occurred',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Silently handle logout errors
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
