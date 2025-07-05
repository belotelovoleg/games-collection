import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { searchIGDBPlatforms, searchIGDBPlatformVersions } from '@/utils/igdb';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// POST /api/admin/igdb/search - Search platforms and platform versions
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Search query must be at least 2 characters long' 
      }, { status: 400 });
    }

    // Search platforms first, then platform versions sequentially
    let platforms: any[] = [];
    let platformVersions: any[] = [];

    try {
      platforms = await searchIGDBPlatforms(query.trim());
    } catch (error) {
      console.error('Error searching IGDB platforms:', error);
      // Continue even if platforms search fails
    }

    try {
      platformVersions = await searchIGDBPlatformVersions(query.trim());
    } catch (error) {
      console.error('Error searching IGDB platform versions:', error);
      // Continue even if platform versions search fails - this endpoint has API limitations
    }

    return NextResponse.json({
      platforms,
      platformVersions,
      query: query.trim()
    });

  } catch (error) {
    console.error('Error searching IGDB:', error);
    
    // Return specific error messages for better debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      error: `IGDB search failed: ${errorMessage}` 
    }, { status: 500 });
  }
}
