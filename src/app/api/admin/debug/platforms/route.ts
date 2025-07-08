import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// GET /api/admin/debug/platforms - Debug endpoint to view platform data
export async function GET() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const platforms = await prisma.igdbPlatform.findMany({
      include: {
        platformFamily: true,
        platformLogo: true,
        platformType: true,
      },
      take: 10, // Limit for debugging
    });

    return NextResponse.json(platforms);
  } catch (error) {
    console.error('Error fetching debug platforms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}