import { NextResponse } from 'next/server';

// Rewrite every non-root request to beta.exora.in, keeping the original path and query.
export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Keep the marketing homepage served from this project.
  if (pathname === '/') {
    return NextResponse.next();
  }

  const target = `https://beta.exora.in${pathname}${search}`;
  return NextResponse.rewrite(target);
}

// Exclude Next.js internals and static assets from the middleware.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
};

