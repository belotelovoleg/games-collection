import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH /api/user/games/[id]/location - Set game location for a game
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const params = context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Guests cannot modify game locations
  if (session.user.role === 'GUEST') {
    return NextResponse.json({ error: 'Guests cannot modify games' }, { status: 403 });
  }
  
  const gameId = params.id;
  const { gameLocationId } = await req.json();
  if (!gameLocationId) {
    return NextResponse.json({ error: 'Missing gameLocationId' }, { status: 400 });
  }
  try {
    // Only allow updating games owned by the current user
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    await prisma.game.update({
      where: { id: gameId },
      data: { gameLocationId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update game location' }, { status: 500 });
  }
}
