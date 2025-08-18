import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// DELETE /api/games/[id] - Delete a game by ID for the current user
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    console.error('Unauthorized access attempt', { session });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Guests cannot delete games
  if (session.user.role === 'GUEST') {
    return NextResponse.json({ error: 'Guests cannot delete games' }, { status: 403 });
  }
  
  const gameId = params.id;
  try {
    // Only allow deleting games owned by the current user
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.userId !== session.user.id) {
      console.error('Game not found or forbidden', { gameId, userId: session.user.id, game });
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    // Delete all S3 images for this game
    const { deleteGameImagesFromS3 } = await import('@/lib/s3');
    try {
      await deleteGameImagesFromS3(game.userId, game.id);
    } catch (s3Error) {
      console.error('Error deleting S3 images', { s3Error, gameId });
    }
    await prisma.game.delete({ where: { id: gameId } });
    console.log('Game deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete game', { error, gameId, userId: session.user.id });
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
