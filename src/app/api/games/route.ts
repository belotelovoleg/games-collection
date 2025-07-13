import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const sort = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('sortOrder') || 'desc';
  const name = searchParams.get('name') || '';
  const consoleId = searchParams.get('consoleId');
  const platform = searchParams.get('platform');
  const completed = searchParams.get('completed');
  const favorite = searchParams.get('favorite');
  const region = searchParams.get('region');
  const labelDamage = searchParams.get('labelDamage');
  const discoloration = searchParams.get('discoloration');
  const rentalSticker = searchParams.get('rentalSticker');
  const testedWorking = searchParams.get('testedWorking');
  const reproduction = searchParams.get('reproduction');
  const steelbook = searchParams.get('steelbook');
  const completeness = searchParams.get('completeness');

  // Build filters
  const where: any = {};
  if (name) {
    where.title = { contains: name, mode: 'insensitive' };
  }
  if (consoleId) {
    where.consoleIds = { has: parseInt(consoleId, 10) };
  }
  if (platform) {
    where.platforms = { has: parseInt(platform, 10) };
  }
  if (completed === 'true') {
    where.completed = true;
  } else if (completed === 'false') {
    where.completed = false;
  }
  if (favorite === 'true') {
    where.favorite = true;
  } else if (favorite === 'false') {
    where.favorite = false;
  }
  if (region) {
    // Only set if valid enum value
    const validRegion = ["REGION_FREE", "NTSC_U", "NTSC_J", "PAL"];
    if (validRegion.includes(region)) {
      where.region = region;
    }
  }
  // Validate condition enum
  const condition = searchParams.get('condition');
  if (condition) {
    const validCondition = ["SEALED", "MINT", "VERY_GOOD", "GOOD", "ACCEPTABLE", "POOR"];
    if (validCondition.includes(condition)) {
      where.condition = condition;
    }
  }
  if (labelDamage === 'true') {
    where.labelDamage = true;
  } else if (labelDamage === 'false') {
    where.labelDamage = false;
  }
  if (discoloration === 'true') {
    where.discoloration = true;
  } else if (discoloration === 'false') {
    where.discoloration = false;
  }
  if (rentalSticker === 'true') {
    where.rentalSticker = true;
  } else if (rentalSticker === 'false') {
    where.rentalSticker = false;
  }
  if (testedWorking === 'true') {
    where.testedWorking = true;
  } else if (testedWorking === 'false') {
    where.testedWorking = false;
  }
  if (reproduction === 'true') {
    where.reproduction = true;
  } else if (reproduction === 'false') {
    where.reproduction = false;
  }
  if (steelbook === 'true') {
    where.steelbook = true;
  } else if (steelbook === 'false') {
    where.steelbook = false;
  }
  if (completeness) {
    const validCompleteness = ["CIB", "GAME_BOX", "GAME_MANUAL", "LOOSE"];
    if (validCompleteness.includes(completeness)) {
      where.completeness = completeness;
    }
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
