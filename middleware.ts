import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import { cookies } from 'next/headers';

async function getSession() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Paths that require authentication
  const protectedPaths = ['/chat', '/settings', '/profile'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Authentication paths
  const authPaths = ['/auth/login', '/auth/register'];
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (isAuthPath && token) {
    const verified = await verifyToken(token);
    if (verified) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/settings/:path*', '/profile/:path*', '/auth/:path*'],
};