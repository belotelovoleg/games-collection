import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: any) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    let platforms;
    if (userId) {
      // Get platforms used by user's consoles
      const userConsoles = await prisma.userConsole.findMany({
        where: { userId },
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
    } else {
      // All platforms
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
