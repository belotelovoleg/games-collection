import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offsetParam = searchParams.get('offset');
  const limitParam = searchParams.get('limit');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const sort = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('sortOrder') || 'desc';
  const name = searchParams.get('name') || '';
  const notes = searchParams.get('notes') || '';
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
  const gameLocationId = searchParams.get('gameLocationId');

  // --- RAW SQL QUERY LOGIC ---
  const session = await (typeof getServerSession !== 'undefined' ? getServerSession(authOptions) : Promise.resolve(null));
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Build SQL WHERE clause and params
  let sqlFilters = ['user_id = $1'];
  let params = [session.user.id];
  let paramIdx = 2;

  if (name) {
    sqlFilters.push(`(name ILIKE $${paramIdx} OR EXISTS (SELECT 1 FROM unnest(alternative_names) alt WHERE alt ILIKE $${paramIdx}))`);
    params.push(`%${name}%`);
    paramIdx++;
  }
  if (notes && notes.trim().length >= 3) {
    sqlFilters.push(`notes ILIKE $${paramIdx}`);
    params.push(`%${notes}%`);
    paramIdx++;
  }
  if (consoleId) {
    sqlFilters.push(`$${paramIdx} = ANY(console_ids)`);
    params.push(consoleId);
    paramIdx++;
  }
  if (platform) {
    sqlFilters.push(`$${paramIdx} = ANY(platforms)`);
    params.push(platform);
    paramIdx++;
  }
  if (completed === 'true') {
    sqlFilters.push('completed = true');
  } else if (completed === 'false') {
    sqlFilters.push('completed = false');
  }
  if (favorite === 'true') {
    sqlFilters.push('favorite = true');
  } else if (favorite === 'false') {
    sqlFilters.push('favorite = false');
  }
  if (region) {
    const validRegion = ["REGION_FREE", "NTSC_U", "NTSC_J", "PAL"];
    if (validRegion.includes(region)) {
      sqlFilters.push(`region = $${paramIdx}`);
      params.push(region);
      paramIdx++;
    }
  }
  if (gameLocationId) {
    sqlFilters.push(`game_location_id = $${paramIdx}`);
    params.push(gameLocationId);
    paramIdx++;
  }
  const condition = searchParams.get('condition');
  if (condition) {
    const validCondition = ["SEALED", "MINT", "VERY_GOOD", "GOOD", "ACCEPTABLE", "POOR"];
    if (validCondition.includes(condition)) {
      sqlFilters.push(`condition = $${paramIdx}`);
      params.push(condition);
      paramIdx++;
    }
  }
  if (labelDamage === 'true') {
    sqlFilters.push('label_damage = true');
  } else if (labelDamage === 'false') {
    sqlFilters.push('label_damage = false');
  }
  if (discoloration === 'true') {
    sqlFilters.push('discoloration = true');
  } else if (discoloration === 'false') {
    sqlFilters.push('discoloration = false');
  }
  if (rentalSticker === 'true') {
    sqlFilters.push('rental_sticker = true');
  } else if (rentalSticker === 'false') {
    sqlFilters.push('rental_sticker = false');
  }
  if (testedWorking === 'true') {
    sqlFilters.push('tested_working = true');
  } else if (testedWorking === 'false') {
    sqlFilters.push('tested_working = false');
  }
  if (reproduction === 'true') {
    sqlFilters.push('reproduction = true');
  } else if (reproduction === 'false') {
    sqlFilters.push('reproduction = false');
  }
  if (steelbook === 'true') {
    sqlFilters.push('steelbook = true');
  } else if (steelbook === 'false') {
    sqlFilters.push('steelbook = false');
  }
  if (completeness) {
    const validCompleteness = ["CIB", "GAME_BOX", "GAME_MANUAL", "LOOSE"];
    if (validCompleteness.includes(completeness)) {
      sqlFilters.push(`completeness = $${paramIdx}`);
      params.push(completeness);
      paramIdx++;
    }
  }

  // Pagination
  const offset = offsetParam !== null ? parseInt(offsetParam, 10) || 0 : (page - 1) * pageSize;
  const limit = limitParam !== null ? parseInt(limitParam, 10) || 20 : pageSize;
  // Sorting
  const orderBy = sort === 'title' ? 'name' : sort;
  const orderDir = order === 'asc' ? 'ASC' : 'DESC';

  // Count query
  const countSql = `SELECT COUNT(*) FROM games WHERE ${sqlFilters.join(' AND ')}`;
  const countResult = await prisma.$queryRawUnsafe(countSql, ...params) as Array<{ count: string }>;
  const total = countResult && countResult.length > 0 ? Number(countResult[0].count) : 0;

  // Data query
  const dataSql = `SELECT *, alternative_names::text[] AS alternative_names FROM games WHERE ${sqlFilters.join(' AND ')} ORDER BY ${orderBy} ${orderDir} OFFSET $${paramIdx} LIMIT $${paramIdx+1}`;
  const dataParams = [...params, offset, limit];
  const games = await prisma.$queryRawUnsafe(dataSql, ...dataParams) as any[];

  // Map alternative_names to alternativeNames for frontend compatibility
  const mappedGames = games.map(g => ({
    ...g,
    alternativeNames: g.alternative_names,
    // Optionally remove the snake_case key if you want
    ...Object.fromEntries(Object.entries(g).filter(([k]) => k !== 'alternative_names'))
  }));

  return Response.json({ games: mappedGames, total });
}
