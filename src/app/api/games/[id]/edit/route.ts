import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH /api/games/[id]/edit - Update a game by ID for the current user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const gameId = params.id;
  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    const body = await req.json();
    const {
      title,
      summary,
      consoleId,
      condition,
      price,
      purchaseDate,
      notes,
      completed,
      favorite,
      rating,
      completeness,
      region,
      labelDamage,
      discoloration,
      rentalSticker,
      testedWorking,
      reproduction
    } = body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (consoleId !== undefined) updateData.consoleIds = [parseInt(consoleId)];
    if (condition !== undefined) updateData.condition = condition;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : undefined;
    if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : undefined;
    if (notes !== undefined) updateData.notes = notes;
    if (completed !== undefined) updateData.completed = !!completed;
    if (favorite !== undefined) updateData.favorite = !!favorite;
    if (rating !== undefined) updateData.rating = typeof rating === 'number' ? rating : 50;
    if (completeness !== undefined) updateData.completeness = completeness;
    if (region !== undefined) updateData.region = region;
    if (labelDamage !== undefined) updateData.labelDamage = !!labelDamage;
    if (discoloration !== undefined) updateData.discoloration = !!discoloration;
    if (rentalSticker !== undefined) updateData.rentalSticker = !!rentalSticker;
    if (testedWorking !== undefined) updateData.testedWorking = typeof testedWorking === 'boolean' ? testedWorking : true;
    if (reproduction !== undefined) updateData.reproduction = !!reproduction;
    const updated = await prisma.game.update({
      where: { id: gameId },
      data: updateData,
    });
    return NextResponse.json({ game: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}
