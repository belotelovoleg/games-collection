import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getIGDBPlatformLogoById } from '@/utils/igdb';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// POST /api/admin/igdb/platform-logo - Get platform logo by ID
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { logoId } = body;

    if (!logoId) {
      return NextResponse.json({ 
        error: 'Logo ID is required' 
      }, { status: 400 });
    }

    try {
      const logo = await getIGDBPlatformLogoById(logoId);
      
      return NextResponse.json({
        logo,
        logoId
      });
    } catch (error) {
      console.error('Error fetching IGDB platform logo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return NextResponse.json({ 
        error: `IGDB platform logo fetch failed: ${errorMessage}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in platform logo API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({ 
      error: `Platform logo API failed: ${errorMessage}` 
    }, { status: 500 });
  }
}
