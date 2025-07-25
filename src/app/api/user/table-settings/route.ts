import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const tableName = searchParams.get('tableName') || 'games';
  const userId = session.user.id;
  const setting = await prisma.userGameTableSetting.findUnique({
    where: { userId_tableName: { userId: String(userId), tableName: String(tableName) } }
  });
  return NextResponse.json({ settings: setting?.settings || null });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const tableName = searchParams.get('tableName') || 'games';
  const userId = session.user.id;
  const body = await req.json();
  const { settings } = body;
  const upserted = await prisma.userGameTableSetting.upsert({
    where: { userId_tableName: { userId: String(userId), tableName: String(tableName) } },
    update: { settings },
    create: { userId: String(userId), tableName: String(tableName), settings }
  });
  return NextResponse.json({ settings: upserted.settings });
}
