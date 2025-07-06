import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import IGDBDataPopulationService from '@/services/igdbDataPopulationService';

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// GET /api/admin/consoles - Get all consoles
export async function GET() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consoles = await prisma.console.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(consoles);
  } catch (error) {
    console.error('Error fetching consoles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/consoles - Create new console (manual or IGDB-powered)
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      photo,
      abbreviation,
      alternativeName,
      generation,
      platformFamily,
      platformType,
      // IGDB fields - if provided, create from IGDB data
      igdbPlatformID,
      igdbPlatformVersionID,
      // Raw IGDB data objects (from UI selection)
      igdbPlatformData,
      igdbPlatformVersionData,
      // Flag to indicate creation type
      fromIGDB = false, // Default to manual creation
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let console;

    // Auto-detect IGDB creation: if we have IGDB IDs, raw IGDB data, or fromIGDB flag
    const hasIGDBData = igdbPlatformID || igdbPlatformVersionID || igdbPlatformData || igdbPlatformVersionData || fromIGDB;

    if (hasIGDBData) {
      // IGDB-powered creation: search IGDB and populate all data
      const igdbService = IGDBDataPopulationService.getInstance();

      const consoleData = await igdbService.createConsoleWithIGDBData({
        name,
        photo,
        abbreviation,
        alternativeName,
        generation: generation ? parseInt(generation) : undefined,
        platformFamily,
        platformType,
        igdbPlatformID,
        igdbPlatformVersionID,
        igdbPlatformData,
        igdbPlatformVersionData,
      });

      console = await igdbService.createConsole(consoleData);
    } else {
      // Manual creation: create console directly without IGDB search
      console = await prisma.console.create({
        data: {
          name,
          photo,
          abbreviation,
          alternativeName,
          generation: generation ? parseInt(generation) : undefined,
          platformFamily,
          platformType,
          igdbPlatformID: igdbPlatformID ? parseInt(igdbPlatformID) : null,
          igdbPlatformVersionID: igdbPlatformVersionID ? parseInt(igdbPlatformVersionID) : null,
        },
        include: {
          igdbPlatform: {
            include: {
              platformFamily: true,
              platformLogo: true,
              platformType: true,
            },
          },
          igdbPlatformVersion: {
            include: {
              platformLogo: true,
            },
          },
        },
      });
    }

    return NextResponse.json(console, { status: 201 });
  } catch (error) {
    console.error('Error creating console:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
