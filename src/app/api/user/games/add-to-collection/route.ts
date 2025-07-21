import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import IGDBService from '@/services/igdbService';
import IGDBGameNormalizationService from '@/services/igdbGameNormalizationService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { igdbGameId, consoleId, condition, price, purchaseDate, notes, photo, completeness, region, labelDamage, discoloration, rentalSticker, testedWorking, reproduction, steelbook, gameLocationId } = body;
    if (!igdbGameId || !consoleId) {
      return NextResponse.json({ error: 'IGDB Game ID and console ID are required' }, { status: 400 });
    }
    const igdbService = IGDBService.getInstance();
    const query = `fields *, cover.*, platforms, genres.*, release_dates.*, involved_companies.company.*, age_ratings.*, artworks.*, screenshots.*, videos.*, websites.*, game_engines.*, game_modes.*, themes.*, player_perspectives.*, multiplayer_modes.*, language_supports.*, alternative_names.*, collections.*, franchises.*, external_games.*; where id = ${igdbGameId};`;
    const igdbGames = await igdbService.makeRequest('https://api.igdb.com/v4/games', query);
    if (!igdbGames || igdbGames.length === 0) {
      return NextResponse.json({ error: 'Game not found in IGDB' }, { status: 404 });
    }
    const igdbGameData = igdbGames[0];
    const userGame = await IGDBGameNormalizationService.createUserGameFromIGDB(
      session.user.id,
      igdbGameData,
      parseInt(consoleId),
      { condition, price: price ? parseFloat(price) : undefined, purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined, notes, photo, completeness, region, labelDamage, discoloration, rentalSticker, testedWorking, reproduction, steelbook, gameLocationId: gameLocationId || null }
    );
    return NextResponse.json({ message: 'Game added to collection successfully', game: userGame });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add game to collection' }, { status: 500 });
  }
}
