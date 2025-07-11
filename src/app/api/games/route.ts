import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const name = searchParams.get('name') || '';
  const consoleId = searchParams.get('consoleId');

  // Build filters
  const where: any = {};
  if (name) {
    where.title = { contains: name, mode: 'insensitive' };
  }
  if (consoleId) {
    where.consoleIds = { has: parseInt(consoleId, 10) };
  }

  // Get total count
  const total = await prisma.game.count({ where });

  // Get paginated games
  const games = await prisma.game.findMany({
    where,
    orderBy: { [sort]: order },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: true,
    },
  });

  return Response.json({ games, total });
}
