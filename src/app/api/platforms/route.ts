import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const platforms = await prisma.igdbPlatform.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(platforms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}
