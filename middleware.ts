import { NextRequest, NextResponse } from 'next/server';

// TikTok Login Kit often requires redirect URI to match exactly (with trailing slash)
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/v1/auth/tiktok/callback/') {
    const url = request.nextUrl.clone();
    url.pathname = '/api/v1/auth/tiktok/callback';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/auth/tiktok/callback/']
};
