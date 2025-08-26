import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Guests cannot modify game notes
    if (session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Guests cannot modify games' }, { status: 403 });
    }

    const { id } = params;
    const { notes } = await request.json();

    // Verify the game belongs to the user
    const existingGame = await prisma.game.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Update the game's notes
    const updatedGame = await prisma.game.update({
      where: { id },
      data: { notes }
    });

    return NextResponse.json({ 
      success: true, 
      notes: updatedGame.notes 
    });

  } catch (error) {
    console.error('Failed to update game notes:', error);
    return NextResponse.json(
      { error: 'Failed to update game notes' },
      { status: 500 }
    );
  }
}
