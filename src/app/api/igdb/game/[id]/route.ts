
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: 'Missing game ID' }, { status: 400 });
  }

  // Helper to recursively convert BigInt to string
  function convertBigIntToString(obj: any): any {
    if (typeof obj === 'bigint') {
      return obj.toString();
    } else if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    } else if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, convertBigIntToString(v)])
      );
    }
    return obj;
  }

  // Query normalized IGDB game from Prisma
  try {
    const igdbGame = await prisma.igdbGame.findUnique({
      where: { id: Number(id) },
      include: {
        cover: true,
        gameGenreRelations: { include: { genre: true } },
        gameAlternativeNameRelations: { include: { alternativeName: true } },
        gameScreenshotRelations: { include: { screenshot: true } },
        gameArtworkRelations: { include: { artwork: true } },
        gameFranchiseRelations: { include: { franchise: true } },
        gameMultiplayerRelations: { include: { multiplayerMode: true } },
        gameWebsiteRelations: { include: { website: true } },
        gameVideoRelations: { include: { video: true } },
        gameLanguageSupportRelations: { include: { languageSupport: true } },
        gameAgeRatingRelations: { include: { ageRating: true } },
        gamePlayerPerspectiveRelations: { include: { playerPerspective: true } },
        gameEngineRelations: { include: { gameEngine: true } },
        gameThemeRelations: { include: { theme: true } },
      }
    });

    if (!igdbGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Convert BigInt fields to string before returning
    const safeGame = convertBigIntToString(igdbGame);
    return NextResponse.json(safeGame);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch IGDB game', details: String(err) }, { status: 500 });
  }
}
