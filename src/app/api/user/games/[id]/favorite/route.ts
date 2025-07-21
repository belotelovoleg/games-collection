import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { id } = params;
  const body = await req.json();
  const { favorite } = body;
  try {
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game || game.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Not found or forbidden' }), { status: 404 });
    }
    const updatedGame = await prisma.game.update({
      where: { id },
      data: { favorite: Boolean(favorite) },
    });
    return new Response(JSON.stringify({ success: true, game: updatedGame }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update favorite' }), { status: 500 });
  }
}
