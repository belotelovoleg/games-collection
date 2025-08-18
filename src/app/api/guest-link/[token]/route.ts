import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Auto-login guest user with a secure token and redirect to games with platform
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Decode the token to get guest ID and platform ID
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { guestId, platformId, expires } = decoded;
    
    // Check if token is expired
    if (Date.now() > expires) {
      return NextResponse.redirect(new URL('/login?error=expired', req.url));
    }
    
    // Find the guest user
    const guest = await prisma.user.findUnique({
      where: { id: guestId, role: 'GUEST' },
      include: {
        guestPlatformPermissions: {
          include: {
            console: true
          }
        }
      }
    });
    
    if (!guest) {
      return NextResponse.redirect(new URL('/login?error=invalid', req.url));
    }
    
    // Check if guest has permission for this platform
    const hasPermission = guest.guestPlatformPermissions.some(
      (perm: any) => perm.console.id === platformId
    );
    
    if (!hasPermission) {
      return NextResponse.redirect(new URL('/login?error=forbidden', req.url));
    }
    
    // Instead of creating a custom JWT, redirect to a special login page with guest credentials
    const loginUrl = new URL('/api/auth/signin', req.url);
    loginUrl.searchParams.set('guest-token', token);
    loginUrl.searchParams.set('callbackUrl', `/games?platform=${platformId}`);
    
    return NextResponse.redirect(loginUrl);
    
  } catch (error) {
    console.error('Guest link error:', error);
    return NextResponse.redirect(new URL('/login?error=invalid', req.url));
  }
}
