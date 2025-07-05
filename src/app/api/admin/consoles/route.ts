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

// GET /api/admin/consoles - Get all consoles
export async function GET() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consoles = await prisma.console.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(consoles);
  } catch (error) {
    console.error('Error fetching consoles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/consoles - Create new console
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      igdbConsoleID,
      igdbConsoleVersionID,
      name,
      photo,
      abbreviation,
      alternativeName,
      generation,
      platformFamily,
      platformType
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const console = await prisma.console.create({
      data: {
        igdbConsoleID: igdbConsoleID ? parseInt(igdbConsoleID) : null,
        igdbConsoleVersionID: igdbConsoleVersionID ? parseInt(igdbConsoleVersionID) : null,
        name,
        photo,
        abbreviation,
        alternativeName,
        generation: generation ? parseInt(generation) : null,
        platformFamily,
        platformType
      }
    });

    return NextResponse.json(console, { status: 201 });
  } catch (error) {
    console.error('Error creating console:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
