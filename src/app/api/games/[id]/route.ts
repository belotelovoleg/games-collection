import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// DELETE /api/games/[id] - Delete a game by ID for the current user
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const gameId = params.id;
  try {
    // Only allow deleting games owned by the current user
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    // Delete all S3 images for this game
    const { deleteGameImagesFromS3 } = await import('@/lib/s3');
    await deleteGameImagesFromS3(game.userId, game.id);
    await prisma.game.delete({ where: { id: gameId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
