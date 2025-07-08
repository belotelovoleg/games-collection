import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { UserConsoleStatus } from '@prisma/client';

// Helper function to check user authentication
async function checkUserAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user;
}

// GET /api/user/consoles - Get user's console collection
export async function GET(request: NextRequest) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as UserConsoleStatus | null;

    const userConsoles = await prisma.userConsole.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      include: {
        console: {
          include: {
            igdbPlatform: {
              include: {
                platformLogo: true,
                platformFamily: true,
                platformType: true,
              },
            },
            igdbPlatformVersion: {
              include: {
                platformLogo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(userConsoles);
  } catch (error) {
    console.error('Error fetching user consoles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/consoles - Add console to user collection
export async function POST(request: NextRequest) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User from session:', { id: user.id, email: user.email, name: user.name });

    const body = await request.json();
    const { consoleId, status = 'OWNED', notes } = body;

    if (!consoleId) {
      return NextResponse.json({ error: 'Console ID is required' }, { status: 400 });
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true }
    });

    // Let's also check what users exist in the database
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log('All users in database:', allUsers);
    console.log('Looking for user ID:', user.id);
    console.log('User ID type:', typeof user.id);

    if (!dbUser) {
      console.error('User not found in database:', user.id);
      // Try to find user by email as fallback
      const userByEmail = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, email: true, name: true }
      });
      console.log('User found by email:', userByEmail);
      
      if (userByEmail) {
        // User exists but with different ID, use the database user
        console.log('Using user found by email instead');
        // Update the user variable to use the database user
        user.id = userByEmail.id;
      } else {
        // Create user in database if they don't exist (fallback for JWT->database migration)
        console.log('Creating user in database as fallback');
        try {
          const newUser = await prisma.user.create({
            data: {
              id: user.id,
              email: user.email,
              name: user.name || '',
              password: '', // Empty password since this is from session
              role: 'USER'
            }
          });
          console.log('User created in database:', newUser);
        } catch (createError) {
          console.error('Failed to create user in database:', createError);
          return NextResponse.json({ 
            error: 'User not found in database and could not be created',
            debug: {
              sessionUserId: user.id,
              sessionUserEmail: user.email,
              allUsers: allUsers,
              userFoundByEmail: userByEmail,
              createError: (createError as Error)?.message || 'Unknown error'
            }
          }, { status: 404 });
        }
      }
    }

    console.log('User found in database:', dbUser);

    // Check if console exists
    const consoleRecord = await prisma.console.findUnique({
      where: { id: parseInt(consoleId) },
    });

    if (!consoleRecord) {
      return NextResponse.json({ error: 'Console not found' }, { status: 404 });
    }

    console.log('Console found:', { id: consoleRecord.id, name: consoleRecord.name });

    // Create or update user console
    const userConsole = await prisma.userConsole.upsert({
      where: {
        userId_consoleId: {
          userId: user.id,
          consoleId: parseInt(consoleId),
        },
      },
      update: {
        status,
        notes,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        consoleId: parseInt(consoleId),
        status,
        notes,
      },
      include: {
        console: {
          include: {
            igdbPlatform: {
              include: {
                platformLogo: true,
                platformFamily: true,
                platformType: true,
              },
            },
            igdbPlatformVersion: {
              include: {
                platformLogo: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(userConsole, { status: 201 });
  } catch (error) {
    console.error('Error adding console to user collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/consoles/[consoleId] - Remove console from user collection
export async function DELETE(request: NextRequest) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consoleId = searchParams.get('consoleId');

    if (!consoleId) {
      return NextResponse.json({ error: 'Console ID is required' }, { status: 400 });
    }

    await prisma.userConsole.delete({
      where: {
        userId_consoleId: {
          userId: user.id,
          consoleId: parseInt(consoleId),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing console from user collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
