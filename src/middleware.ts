import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

type CookieToSet = {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
};

/**
 * Check if the path requires admin authentication
 */
function isProtectedAdminPath(pathname: string): boolean {
  // Protect all /admin/* paths except /admin/login
  return pathname.startsWith('/admin') && pathname !== '/admin/login';
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  // Skip Supabase auth if environment variables are not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  let supabaseResponse = response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check authentication for protected admin routes
  if (isProtectedAdminPath(pathname)) {
    // Allow access in development when DEV_SKIP_AUTH is enabled
    if (process.env.DEV_SKIP_AUTH === 'true') {
      return supabaseResponse;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login page with return URL
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // For non-protected routes, still refresh the session
    await supabase.auth.getUser();
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
