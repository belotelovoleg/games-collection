import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const gameId = params.id;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { photos, cover, screenshot } = body;
  if (photos !== undefined) {
    if (!Array.isArray(photos) || photos.length > 5) {
      return NextResponse.json({ error: 'Photos must be an array of up to 5 URLs.' }, { status: 400 });
    }
  }
  if (cover !== undefined && typeof cover !== 'string') {
    return NextResponse.json({ error: 'Cover must be a string URL.' }, { status: 400 });
  }
  if (screenshot !== undefined && typeof screenshot !== 'string') {
    return NextResponse.json({ error: 'Screenshot must be a string URL.' }, { status: 400 });
  }
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.userId !== session.user.id) {
    return NextResponse.json({ error: 'Game not found or not owned by user.' }, { status: 404 });
  }
  const updateData: any = {};
  if (photos !== undefined) updateData.photos = photos;
  if (cover !== undefined) updateData.cover = cover;
  if (screenshot !== undefined) updateData.screenshot = screenshot;
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided.' }, { status: 400 });
  }
  const updated = await prisma.game.update({
    where: { id: gameId },
    data: updateData,
  });
  return NextResponse.json({ updated });
}
