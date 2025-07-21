import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import IGDBService from '@/services/igdbService';

// GET /api/games/search - Search games on IGDB for a specific console platform
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consoleId = searchParams.get('consoleId');
    const searchQuery = searchParams.get('query');

    // Validate required parameters
    if (!consoleId || !searchQuery) {
      return NextResponse.json({ 
        error: 'Missing required parameters: consoleId and query' 
      }, { status: 400 });
    }

    // Get console and its IGDB platform ID
    const selectedConsole = await prisma.console.findUnique({
      where: { id: parseInt(consoleId) },
      select: {
        id: true,
        name: true,
        igdbPlatformID: true,
      },
    });

    if (!selectedConsole) {
      return NextResponse.json({ error: 'Console not found' }, { status: 404 });
    }

    if (!selectedConsole.igdbPlatformID) {
      return NextResponse.json({ 
        error: 'Console is not associated with an IGDB platform' 
      }, { status: 400 });
    }

    // Search games on IGDB
    const igdbService = IGDBService.getInstance();
    
    // console.log(`🎮 Searching IGDB games: "${searchQuery}" for platform ${selectedConsole.igdbPlatformID} (${selectedConsole.name})`);
    
    const games = await igdbService.searchGames(searchQuery, selectedConsole.igdbPlatformID);
    
    // console.log(`📊 Found ${games.length} games for "${searchQuery}" on ${selectedConsole.name}`);
    
    // Log detailed information about the first result
    // if (games.length > 0) {
    //   console.log('\n🔍 DETAILED FIRST RESULT:');
    //   console.log('='.repeat(50));
    //   console.log('📋 Full first game object:');
    //   console.log(JSON.stringify(games[0], null, 2));
    //   console.log('='.repeat(50));
      
    //   // Log specific fields for easy reading
    //   const firstGame = games[0];
    //   console.log('\n📄 PARSED FIELDS:');
    //   console.log(`🎮 Game ID: ${firstGame.id}`);
    //   console.log(`📝 Name: ${firstGame.name}`);
    //   console.log(`📖 Summary: ${firstGame.summary || 'N/A'}`);
    //   console.log(`🖼️  Cover: ${firstGame.cover ? JSON.stringify(firstGame.cover, null, 2) : 'N/A'}`);
    //   console.log(`🎯 Platforms: ${firstGame.platforms ? JSON.stringify(firstGame.platforms) : 'N/A'}`);
    //   console.log(`🎭 Genres: ${firstGame.genres ? JSON.stringify(firstGame.genres, null, 2) : 'N/A'}`);
    //   console.log(`📅 Release Dates: ${firstGame.release_dates ? JSON.stringify(firstGame.release_dates, null, 2) : 'N/A'}`);
    //   console.log(`🏢 Companies: ${firstGame.involved_companies ? JSON.stringify(firstGame.involved_companies, null, 2) : 'N/A'}`);
    //   console.log('='.repeat(50));
    // }
    
    // console.log('\n📊 ALL GAMES SUMMARY:');
    // games.forEach((game, index) => {
    //   console.log(`${index + 1}. ${game.name} (ID: ${game.id})`);
    // });

    return NextResponse.json({
      console: {
        id: selectedConsole.id,
        name: selectedConsole.name,
        igdbPlatformID: selectedConsole.igdbPlatformID,
      },
      searchQuery,
      games,
    });

  } catch (error) {
    console.error('❌ Error searching games:', error);
    
    // Handle rate limiting
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again in a moment.' 
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
