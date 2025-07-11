import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { completed } = body;

  try {
    const game = await prisma.game.update({
      where: { id },
      data: { completed: Boolean(completed) },
    });
    return new Response(JSON.stringify({ success: true, game }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update completed' }), { status: 500 });
  }
}
