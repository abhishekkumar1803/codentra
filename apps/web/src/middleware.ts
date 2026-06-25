import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

const protectedPrefixes = [
  '/dashboard',
  '/subscribe',
  '/jobs',
  '/referrals',
  '/leaderboards',
  '/contests',
  '/quizzes',
  '/admin',
  '/services',
  '/mentor',
  '/employer',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  if (token && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contests/:path*',
    '/quizzes/:path*',
    '/leaderboards/:path*',
    '/jobs/:path*',
    '/referrals/:path*',
    '/services/:path*',
    '/mentor/:path*',
    '/employer/:path*',
    '/subscribe',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
