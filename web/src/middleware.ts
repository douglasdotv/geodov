import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { unsealData } from 'iron-session';
import { sessionOptions, type AdminSessionData } from './lib/session';

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get(sessionOptions.cookieName);
  const session = cookie
    ? await unsealData<AdminSessionData>(cookie.value, {
        password: sessionOptions.password,
      })
    : { isLoggedIn: false };

  const { isLoggedIn } = session;
  const { pathname } = request.nextUrl;

  if (!isLoggedIn && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
