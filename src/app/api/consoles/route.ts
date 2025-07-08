import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Helper function to check user authentication
async function checkUserAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user;
}

// GET /api/consoles - Get all consoles for browsing (for authenticated users)
export async function GET(request: NextRequest) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const consoles = await prisma.console.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { alternativeName: { contains: search, mode: 'insensitive' } },
          { abbreviation: { contains: search, mode: 'insensitive' } },
          { platformFamily: { contains: search, mode: 'insensitive' } },
          { platformType: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      include: {
        igdbPlatform: {
          include: {
            platformLogo: true,
            platformFamily: true,
            platformType: true,
          },
        },
        igdbPlatformVersion: {
          include: {
            platformLogo: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get user's console statuses separately
    const userConsoleStatuses = await prisma.userConsole.findMany({
      where: {
        userId: user.id,
        consoleId: {
          in: consoles.map(console => console.id),
        },
      },
      select: {
        consoleId: true,
        status: true,
        notes: true,
      },
    });

    console.log('User ID:', user.id);
    console.log('Console IDs:', consoles.map(c => c.id));
    console.log('User console statuses found:', userConsoleStatuses);

    // Map user console statuses to consoles
    const consolesWithUserStatus = consoles.map(console => ({
      ...console,
      userStatus: userConsoleStatuses.find(uc => uc.consoleId === console.id) || null,
    }));

    return NextResponse.json(consolesWithUserStatus);
  } catch (error) {
    console.error('Error fetching consoles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
