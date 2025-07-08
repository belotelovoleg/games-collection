import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getIGDBParentPlatformByVersionId } from '@/utils/igdb';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// POST /api/admin/igdb/parent-platform - Get parent platform by version ID
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ 
        error: 'Version ID is required' 
      }, { status: 400 });
    }

    try {
      const platform = await getIGDBParentPlatformByVersionId(versionId);
      
      return NextResponse.json({
        platform,
        versionId
      });
    } catch (error) {
      console.error('Error fetching IGDB parent platform:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return NextResponse.json({ 
        error: `IGDB parent platform fetch failed: ${errorMessage}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in parent platform API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      error: `Parent platform API failed: ${errorMessage}` 
    }, { status: 500 });
  }
}
