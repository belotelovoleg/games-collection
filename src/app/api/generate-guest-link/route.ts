import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST: Generate a guest link for a specific guest and platform
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only USER and ADMIN can generate guest links
  if (session.user.role !== 'USER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const { guestEmail, platformId, expiresInDays = 30 } = await req.json();
    
    // Find the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the guest user created by this user
    const guest = await prisma.user.findFirst({
      where: {
        email: guestEmail,
        role: 'GUEST',
        createdByUserId: currentUser.id
      },
      include: {
        guestPlatformPermissions: {
          include: {
            console: true
          }
        }
      }
    });
    
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }
    
    // Check if guest has permission for this platform
    const hasPermission = guest.guestPlatformPermissions.some(
      (perm: any) => perm.console.id === parseInt(platformId)
    );
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Guest does not have permission for this platform' 
      }, { status: 403 });
    }
    
    // Create token data
    const tokenData = {
      guestId: guest.id,
      platformId: parseInt(platformId),
      expires: Date.now() + (expiresInDays * 24 * 60 * 60 * 1000)
    };
    
    // Encode as base64 token
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    
    // Generate the full URL
    const baseUrl = process.env.NEXTAUTH_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const guestLink = `${baseUrl}/api/guest-link/${token}`;
    
    return NextResponse.json({
      success: true,
      guestLink,
      expiresAt: new Date(tokenData.expires).toISOString(),
      guest: {
        email: guest.email,
        platform: guest.guestPlatformPermissions.find((p: any) => p.console.id === parseInt(platformId))?.console.name
      }
    });
    
  } catch (error) {
    console.error('Generate guest link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
