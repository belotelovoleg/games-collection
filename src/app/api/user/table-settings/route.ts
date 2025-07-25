import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const tableName = searchParams.get('tableName') || 'games';

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const setting = await prisma.userGameTableSetting.findUnique({
    where: { userId_tableName: { userId: String(userId), tableName: String(tableName) } }
  });
  return NextResponse.json({ settings: setting?.settings || null });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const tableName = searchParams.get('tableName') || 'games';

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const body = await req.json();
  const { settings } = body;

  const upserted = await prisma.userGameTableSetting.upsert({
    where: { userId_tableName: { userId: String(userId), tableName: String(tableName) } },
    update: { settings },
    create: { userId: String(userId), tableName: String(tableName), settings }
  });
  return NextResponse.json({ settings: upserted.settings });
}
