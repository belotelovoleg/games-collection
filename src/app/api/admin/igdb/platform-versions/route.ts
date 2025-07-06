import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getIGDBAccessToken } from '@/utils/igdb';
import { buildPlatformVersionQuery } from '@/constants/igdbFields';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// POST /api/admin/igdb/platform-versions - Fetch specific platform versions by IDs
export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass auth for testing
    // const isAdmin = await checkAdminAccess();
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { versionIds } = body;

    if (!versionIds) {
      return NextResponse.json({ error: 'Version IDs are required' }, { status: 400 });
    }

    const token = await getIGDBAccessToken();
    
    const query = buildPlatformVersionQuery(`where id = (${versionIds})`, 50);

    const response = await fetch('https://api.igdb.com/v4/platform_versions', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain'
      },
      body: query
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[IGDB Platform Versions] API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch platform versions from IGDB' }, { status: 500 });
    }

    const platformVersions = await response.json();

    return NextResponse.json({
      success: true,
      platformVersions,
      count: platformVersions.length,
      message: `Found ${platformVersions.length} platform version(s)`
    });

  } catch (error) {
    console.error('[IGDB Platform Versions] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch platform versions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
