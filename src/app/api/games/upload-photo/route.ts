import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const userId = formData.get('userId') as string | null;
  if (!file || !userId) {
    return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = `user/${userId}/games/${Date.now()}-game-photo.jpg`;
  const url = await uploadToS3({
    key,
    body: buffer,
    contentType: file.type || 'image/jpeg',
    cacheControl: 'no-cache',
  });
  return NextResponse.json({ url });
}
