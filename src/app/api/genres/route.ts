import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const genres = await prisma.igdbGenre.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(genres);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
