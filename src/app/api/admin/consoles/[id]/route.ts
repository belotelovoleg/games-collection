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

// PUT /api/admin/consoles/[id] - Update console
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const consoleId = parseInt(id);
    
    if (isNaN(consoleId)) {
      return NextResponse.json({ error: 'Invalid console ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      igdbPlatformID,
      igdbPlatformVersionID,
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

    const console = await prisma.console.update({
      where: { id: consoleId },
      data: {
        igdbPlatformID: igdbPlatformID ? parseInt(igdbPlatformID) : null,
        igdbPlatformVersionID: igdbPlatformVersionID ? parseInt(igdbPlatformVersionID) : null,
        name,
        photo,
        abbreviation,
        alternativeName,
        generation: generation ? parseInt(generation) : null,
        platformFamily,
        platformType
      }
    });

    return NextResponse.json(console);
  } catch (error) {
    console.error('Error updating console:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/consoles/[id] - Delete console
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const consoleId = parseInt(id);
    
    if (isNaN(consoleId)) {
      return NextResponse.json({ error: 'Invalid console ID' }, { status: 400 });
    }

    await prisma.console.delete({
      where: { id: consoleId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting console:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
