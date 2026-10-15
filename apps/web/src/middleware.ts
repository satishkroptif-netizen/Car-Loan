import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
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
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not logged in and trying to access protected routes
  const protectedPaths = ['/dashboard', '/leads', '/pipeline', '/deals', '/orders', '/inventory', '/tickets', '/procurement', '/aion', '/settings'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in, try to get their organization
  if (user) {
    // Try to get org_id from user metadata (set during signup)
    const orgId = user.user_metadata?.org_id || '11111111-1111-1111-1111-111111111111';
    
    // Add org ID to headers so Server Actions can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-org-id', orgId);
    requestHeaders.set('x-user-id', user.id);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|login|api).*)',
  ],
};