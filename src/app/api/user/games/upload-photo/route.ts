import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const userId = formData.get('userId') as string | null;
  const gameId = formData.get('gameId') as string | null;
  const photoNumber = formData.get('photoNumber') as string | null;
  const filename = (formData.get('file') as File | null)?.name || '';

  if (!file || !userId || !gameId) {
    return NextResponse.json({ error: 'Missing file, userId, or gameId' }, { status: 400 });
  }

  // Determine type: photo, cover, screenshot
  let type: 'photo' | 'cover' | 'screenshot' = 'photo';
  if (filename.includes('cover')) type = 'cover';
  else if (filename.includes('screenshot')) type = 'screenshot';

  // For photos, require photoNumber
  if (type === 'photo' && !photoNumber) {
    return NextResponse.json({ error: 'Missing photoNumber for photo upload' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const timestamp = Date.now();
  let key = '';
  if (type === 'photo') {
    key = `user/${userId}/games/${gameId}/photos/${timestamp}-game-photo_${photoNumber}.jpg`;
  } else if (type === 'cover') {
    key = `user/${userId}/games/${gameId}/covers/${timestamp}-game-cover.jpg`;
  } else if (type === 'screenshot') {
    key = `user/${userId}/games/${gameId}/screenshots/${timestamp}-game-screenshot.jpg`;
  }
  const url = await uploadToS3({
    key,
    body: buffer,
    contentType: file.type || 'image/jpeg',
    cacheControl: 'no-cache',
  });
  return NextResponse.json({ url });
}
