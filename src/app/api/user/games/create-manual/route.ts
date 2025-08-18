import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Guests cannot create games
    if (session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Guests cannot create games' }, { status: 403 });
    }

    const body = await request.json();
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
      cover,
      screenshot,
      photos,
      completeness,
      region,
      labelDamage,
      discoloration,
      rentalSticker,
      testedWorking,
      reproduction, 
      steelbook,
      gameLocationId,
      platforms: payloadPlatforms
    } = body;

    if (!title || !consoleId) {
      return NextResponse.json(
        { error: 'Title and console ID are required' },
        { status: 400 }
      );
    }

    // Get the console and its igdbPlatformID
    let platforms: number[] = Array.isArray(payloadPlatforms) && payloadPlatforms.length > 0 ? payloadPlatforms : [];
    if (platforms.length === 0 && consoleId) {
      const console = await prisma.console.findUnique({
        where: { id: parseInt(consoleId) },
        select: { igdbPlatformID: true }
      });
      if (console?.igdbPlatformID) {
        platforms = [console.igdbPlatformID];
      }
    }

    // Create the game
    const game = await prisma.game.create({
      data: {
        userId: session.user.id,
        title,
        summary,
        consoleIds: [parseInt(consoleId)],
        platforms,
        condition: condition || 'GOOD',
        price: price ? parseFloat(price) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        notes,
        completed: !!completed,
        favorite: !!favorite,
        rating: typeof rating === 'number' ? rating : 50,
        cover: cover || null,
        screenshot: screenshot || null,
        photos: Array.isArray(photos) ? photos.filter(Boolean) : [],
        completeness: completeness || 'CIB',
        region: region || 'REGION_FREE',
        labelDamage: !!labelDamage,
        discoloration: !!discoloration,
        rentalSticker: !!rentalSticker,
        testedWorking: typeof testedWorking === 'boolean' ? testedWorking : true,
        reproduction: !!reproduction,
        steelbook: !!steelbook,
        genres: [],
        franchises: [],
        ...(gameLocationId ? { gameLocationId } : {}),
        multiplayerModes: [],
        developer: [],
        publisher: [],
      },
    });

    return NextResponse.json({
      message: 'Manual game created successfully',
      game,
    });
  } catch (error) {
    console.error('❌ Error creating manual game:', error);
    return NextResponse.json(
      { error: 'Failed to create manual game' },
      { status: 500 }
    );
  }
}
