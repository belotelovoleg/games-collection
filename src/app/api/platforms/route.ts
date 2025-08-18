import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: any) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope');
    let platforms;
    
    if (scope === 'me' && session?.user?.id) {
      if (session.user.role === 'GUEST') {
        // Get platforms that the guest has permission to see
        const guestUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            guestPlatformPermissions: {
              include: {
                console: {
                  select: { igdbPlatformID: true }
                }
              }
            }
          }
        });
        
        if (!guestUser?.guestPlatformPermissions) {
          return NextResponse.json([]);
        }
        
        const platformIds = Array.from(new Set(
          guestUser.guestPlatformPermissions
            .map(permission => permission.console.igdbPlatformID)
            .filter((id): id is number => id !== null)
        ));
        
        platforms = await prisma.igdbPlatform.findMany({
          where: { id: { in: platformIds } },
          select: {
            id: true,
            name: true,
            platformLogo: {
              select: {
                url: true,
                imageId: true,
              }
            }
          },
          orderBy: { name: 'asc' },
        });
      } else {
        // Get platforms used by user's consoles (for USER and ADMIN roles)
        const userConsoles = await prisma.userConsole.findMany({
          where: { userId: session.user.id },
          select: { console: { select: { igdbPlatformID: true } } }
        });
        const platformIds = Array.from(new Set(userConsoles.map(uc => uc.console.igdbPlatformID).filter((id): id is number => typeof id === 'number')));
        platforms = await prisma.igdbPlatform.findMany({
          where: { id: { in: platformIds } },
          select: {
            id: true,
            name: true,
            platformLogo: {
              select: {
                url: true,
                imageId: true,
              }
            }
          },
          orderBy: { name: 'asc' },
        });
      }
    } else {
      // All platforms (when scope is not 'me' or user is not authenticated)
      platforms = await prisma.igdbPlatform.findMany({
        select: {
          id: true,
          name: true,
          platformLogo: {
            select: {
              url: true,
              imageId: true,
            }
          }
        },
        orderBy: { name: 'asc' },
      });
    }
    return NextResponse.json(platforms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}
