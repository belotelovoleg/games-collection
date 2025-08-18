import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Get guest credentials for auto-login (secure endpoint)
export async function POST(req: NextRequest) {
  try {
    const { guestId } = await req.json();
    
    if (!guestId) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 });
    }
    
    // Find the guest user
    const guest = await prisma.user.findUnique({
      where: { id: guestId, role: 'GUEST' },
      select: {
        id: true,
        email: true,
        password: true // We need this to create a temporary login
      }
    });
    
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }
    
    // For security, we'll return the email and the hashed password
    // The client will use these with the existing auth system
    return NextResponse.json({
      email: guest.email,
      tempPassword: guest.password // This is already hashed
    });
    
  } catch (error) {
    console.error('Guest credentials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
