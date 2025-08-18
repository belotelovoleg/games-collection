import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only logged in USER or ADMIN role can view their guests
    if (!session?.user?.id || (session.user.role !== 'USER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only USER and ADMIN accounts can view guest accounts' },
        { status: 403 }
      );
    }

    // Get all guest accounts created by this user, including allowed platforms
    const guests = await prisma.user.findMany({
      where: {
        createdByUserId: session.user.id,
        role: 'GUEST'
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        name: true,
        guestPlatformPermissions: {
          select: {
            console: {
              select: {
                id: true,
                name: true,
                photo: true,
                abbreviation: true,
                igdbPlatformID: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ guests });
  } catch (error) {
    console.error('Error fetching guest accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest accounts' },
      { status: 500 }
    );
  }
}
