import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // Check if this is a request to games page and user is not authenticated
  if (request.nextUrl.pathname.startsWith('/games') || request.nextUrl.pathname.includes('/games')) {
    const guestSession = request.cookies.get('guest-session');
    
    if (guestSession?.value) {
      try {
        // Verify the guest session token
        const decoded = verify(guestSession.value, process.env.NEXTAUTH_SECRET!) as any;
        
        // If valid and it's a guest, allow the request
        if (decoded.role === 'GUEST') {
          // The session will be handled by NextAuth on the client side
          const response = NextResponse.next();
          
          // Optionally, we could set additional headers here
          return response;
        }
      } catch (error) {
        // Invalid token, remove it
        const response = NextResponse.next();
        response.cookies.delete('guest-session');
        return response;
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/games/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
