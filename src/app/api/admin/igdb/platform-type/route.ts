import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// POST /api/admin/igdb/platform-type - Get platform type name by ID
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platformTypeId } = body;

    if (!platformTypeId) {
      return NextResponse.json({ 
        error: 'Platform Type ID is required' 
      }, { status: 400 });
    }

    try {
      // Get IGDB access token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.IGDB_CLIENT_ID!,
          client_secret: process.env.IGDB_CLIENT_SECRET!,
          grant_type: 'client_credentials',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get IGDB access token');
      }

      const tokenData = await tokenResponse.json();

      // Query IGDB platform_types endpoint
      const igdbResponse = await fetch('https://api.igdb.com/v4/platform_types', {
        method: 'POST',
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID!,
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: `fields name; where id = ${platformTypeId};`,
      });

      if (!igdbResponse.ok) {
        throw new Error(`IGDB API error: ${igdbResponse.status}`);
      }

      const platformTypes = await igdbResponse.json();
      
      if (platformTypes.length === 0) {
        return NextResponse.json({ 
          error: 'Platform type not found' 
        }, { status: 404 });
      }

      return NextResponse.json({
        id: platformTypeId,
        name: platformTypes[0].name
      });

    } catch (error) {
      console.error('Error fetching IGDB platform type:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return NextResponse.json({ 
        error: `IGDB platform type fetch failed: ${errorMessage}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in platform type API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      error: `Platform type API failed: ${errorMessage}` 
    }, { status: 500 });
  }
}
