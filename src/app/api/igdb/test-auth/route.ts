import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { igdbAuth } from '@/utils/igdbAuth';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// POST /api/igdb/test-auth - Test IGDB authentication
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test authentication by getting access token
    const accessToken = await igdbAuth.getAccessToken();
    
    // Test with a simple platforms query to verify the token works
    const platforms = await igdbAuth.makeRequest('platforms', 'fields name,abbreviation; limit 5;');

    return NextResponse.json({
      success: true,
      message: 'IGDB authentication successful',
      tokenAcquired: true,
      sampleData: platforms
    });

  } catch (error) {
    console.error('IGDB authentication error:', error);
    return NextResponse.json({ 
      error: 'Failed to authenticate with IGDB', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
