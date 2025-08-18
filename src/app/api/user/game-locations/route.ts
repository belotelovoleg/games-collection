import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
// PATCH: Update location name
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Guests cannot modify locations
  if (session.user.role === 'GUEST') {
    return NextResponse.json({ error: 'Guests cannot modify locations' }, { status: 403 });
  }
  
  const { id, name, note } = await req.json();
  if (!id || typeof id !== 'string' || !name || typeof name !== 'string' || name.length < 2) {
    return NextResponse.json({ error: 'ID and valid name required' }, { status: 400 });
  }
  const location = await prisma.gameLocation.update({
    where: { id, userId: session.user.id },
    data: { name, note: typeof note === 'string' ? note : null },
  });
  return NextResponse.json(location);
}

// DELETE: Remove a location
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Guests cannot delete locations
  if (session.user.role === 'GUEST') {
    return NextResponse.json({ error: 'Guests cannot delete locations' }, { status: 403 });
  }
  
  const { id } = await req.json();
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  // Set gameLocationId to null for all games referencing this location
  await prisma.game.updateMany({
    where: { gameLocationId: id, userId: session.user.id },
    data: { gameLocationId: null },
  });
  // Now delete the location
  await prisma.gameLocation.delete({
    where: { id, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}

// GET: List all locations for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Determine which user's locations to show based on role
  let targetUserId = session.user.id;
  
  if (session.user.role === 'GUEST') {
    // Guests can only see locations from their creator
    const guestUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { createdByUser: true }
    });
    
    if (!guestUser?.createdByUser) {
      return NextResponse.json({ error: 'Guest account has no associated creator' }, { status: 403 });
    }
    
    targetUserId = guestUser.createdByUser.id;
  }
  
  const url = new URL(req.url);
  const withDetails = url.searchParams.get('withDetails');
  if (withDetails) {
    // Return locations with gamesCount and note
    const locations = await prisma.gameLocation.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { games: true },
        },
      },
    });
    // Map to include gamesCount and note field
    const result = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      note: loc.note,
      createdAt: loc.createdAt,
      updatedAt: loc.updatedAt,
      gamesCount: loc._count.games,
    }));
    return NextResponse.json(result);
  } else {
    // Default: no additional properties
    const locations = await prisma.gameLocation.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(locations);
  }
}

// POST: Create a new location
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Guests cannot create locations
  if (session.user.role === 'GUEST') {
    return NextResponse.json({ error: 'Guests cannot create locations' }, { status: 403 });
  }
  
  const { name, note } = await req.json();
  if (!name || typeof name !== 'string' || name.length < 2) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }
  // Enforce max 100 locations per user
  const count = await prisma.gameLocation.count({ where: { userId: session.user.id } });
  if (count >= 100) {
    return NextResponse.json({ error: 'Maximum 100 locations allowed per user.' }, { status: 400 });
  }
  const location = await prisma.gameLocation.create({
    data: { name, userId: session.user.id, note: typeof note === 'string' ? note : null },
  });
  return NextResponse.json(location);
}
