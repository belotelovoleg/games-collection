import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Get current user's mobile card view mode
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { mobileCardViewMode: true },
  });
  return NextResponse.json({ mobileCardViewMode: user?.mobileCardViewMode ?? 1 });
}

// PUT: Update current user's mobile card view mode
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { mobileCardViewMode } = await req.json();
  await prisma.user.update({
    where: { email: session.user.email },
    data: { mobileCardViewMode },
  });
  return NextResponse.json({ success: true });
}
