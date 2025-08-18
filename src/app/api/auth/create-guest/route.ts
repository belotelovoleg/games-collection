import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only logged in USER or ADMIN role can create guests
    if (!session?.user?.id || (session.user.role !== 'USER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only USER and ADMIN accounts can create guest accounts' },
        { status: 403 }
      );
    }

    const { email, password, platformIds } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!platformIds || !Array.isArray(platformIds) || platformIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the guest user with platform permissions
    const guestUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'GUEST' as Role,
        createdByUserId: session.user.id,
      }
    });

    // Create platform permissions
    const platformPermissions = platformIds.map((consoleId: number) => ({
      guestId: guestUser.id,
      consoleId: consoleId,
    }));

    await prisma.guestPlatformPermission.createMany({
      data: platformPermissions,
    });

    return NextResponse.json({
      success: true,
      message: 'Guest account created successfully',
      guestId: guestUser.id,
      email: guestUser.email
    });

  } catch (error) {
    console.error('Error creating guest account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
