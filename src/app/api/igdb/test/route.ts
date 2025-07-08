import { NextRequest, NextResponse } from 'next/server';
import IGDBService from '@/services/igdbService';

// GET /api/igdb/test - Test IGDB connection and simple query
export async function GET() {
  try {
    const igdbService = IGDBService.getInstance();
    
    console.log('🧪 Testing IGDB connection...');
    
    // Test 1: Simple authentication
    await igdbService.authenticate();
    console.log('✅ Authentication successful');
    
    // Test 2: Simple platforms query
    const platforms = await igdbService.searchPlatforms('Nintendo');
    console.log(`✅ Found ${platforms.length} platforms with "Nintendo"`);
    
    // Test 3: Simple games query (without platform filter)
    const simpleQuery = `
      fields name, platforms;
      search "Mario";
      limit 5;
    `.trim();
    
    console.log('🔍 Testing simple games query:', simpleQuery);
    const games = await igdbService.makeRequest('https://api.igdb.com/v4/games', simpleQuery);
    console.log(`✅ Found ${games.length} games with "Mario"`);
    
    return NextResponse.json({
      success: true,
      tests: {
        authentication: 'passed',
        platforms: `${platforms.length} results`,
        games: `${games.length} results`,
        gamesSample: games.slice(0, 3)
      }
    });

  } catch (error) {
    console.error('❌ IGDB test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
