import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import IGDBService from '@/services/igdbService';
import IGDBGameNormalizationService from '@/services/igdbGameNormalizationService';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      igdbGameId,
      consoleId,
      condition,
      price,
      purchaseDate,
      notes,
      photo,
      completeness,
      region,
      labelDamage,
      discoloration,
      rentalSticker,
      testedWorking,
      reproduction,
      steelbook
    } = body;

    if (!igdbGameId || !consoleId) {
      return NextResponse.json(
        { error: 'IGDB Game ID and console ID are required' },
        { status: 400 }
      );
    }

    console.log(`🎮 Adding game ${igdbGameId} to collection for user ${session.user.email}`);

    // Get fresh IGDB data for the game
    const igdbService = IGDBService.getInstance();
    
    // For now, let's create a simple query to get the game by ID
    // We'll need to enhance the IGDB service to support fetching by ID
    const query = `
      fields *, cover.*, platforms, genres.*, release_dates.*, involved_companies.company.*, 
             age_ratings.*, artworks.*, screenshots.*, videos.*, websites.*, 
             game_engines.*, game_modes.*, themes.*, player_perspectives.*, 
             multiplayer_modes.*, language_supports.*, alternative_names.*, 
             collections.*, franchises.*, external_games.*;
      where id = ${igdbGameId};
    `;

    const igdbGames = await igdbService.makeRequest('https://api.igdb.com/v4/games', query);
    
    if (!igdbGames || igdbGames.length === 0) {
      return NextResponse.json(
        { error: 'Game not found in IGDB' },
        { status: 404 }
      );
    }

    const igdbGameData = igdbGames[0];

    // Create user game from IGDB data
    const userGame = await IGDBGameNormalizationService.createUserGameFromIGDB(
      session.user.id!,
      igdbGameData,
      parseInt(consoleId),
      {
        condition,
        price: price ? parseFloat(price) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        notes,
        photo,
        completeness,
        region,
        labelDamage,
        discoloration,
        rentalSticker,
        testedWorking,
        reproduction,
        steelbook
      }
    );

    console.log(`✅ Successfully added game to collection: ${userGame.title}`);

    return NextResponse.json({
      message: 'Game added to collection successfully',
      game: userGame,
    });
  } catch (error: any) {
    console.error('❌ Error adding game to collection:', error);
    return NextResponse.json(
      { error: error?.message || String(error), stack: error?.stack },
      { status: 500 }
    );
  }
}
