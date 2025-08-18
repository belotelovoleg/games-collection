import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only logged in USER or ADMIN role can delete guests
    if (!session?.user?.id || (session.user.role !== 'USER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only USER and ADMIN accounts can delete guest accounts' },
        { status: 403 }
      );
    }

    const guestId = params.id;

    // Verify that this guest was created by the current user
    const guest = await prisma.user.findFirst({
      where: {
        id: guestId,
        createdByUserId: session.user.id,
        role: 'GUEST'
      }
    });

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest account not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the guest account
    // Note: Prisma will handle cascading deletes for related data (sessions, etc.)
    await prisma.user.delete({
      where: {
        id: guestId
      }
    });

    return NextResponse.json({ 
      message: 'Guest account deleted successfully',
      deletedGuestEmail: guest.email 
    });
  } catch (error) {
    console.error('Error deleting guest account:', error);
    return NextResponse.json(
      { error: 'Failed to delete guest account' },
      { status: 500 }
    );
  }
}
