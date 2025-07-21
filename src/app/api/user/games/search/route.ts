import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import IGDBService from '@/services/igdbService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const consoleId = searchParams.get('consoleId');
    const searchQuery = searchParams.get('query');
    if (!consoleId || !searchQuery) {
      return NextResponse.json({ error: 'Missing required parameters: consoleId and query' }, { status: 400 });
    }
    const selectedConsole = await prisma.console.findUnique({
      where: { id: parseInt(consoleId) },
      select: { id: true, name: true, igdbPlatformID: true },
    });
    if (!selectedConsole) {
      return NextResponse.json({ error: 'Console not found' }, { status: 404 });
    }
    if (!selectedConsole.igdbPlatformID) {
      return NextResponse.json({ error: 'Console is not associated with an IGDB platform' }, { status: 400 });
    }
    const igdbService = IGDBService.getInstance();
    const games = await igdbService.searchGames(searchQuery, selectedConsole.igdbPlatformID);
    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search IGDB games' }, { status: 500 });
  }
}
