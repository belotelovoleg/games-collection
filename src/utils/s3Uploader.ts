// src/utils/s3Uploader.ts

/**
 * Uploads an image file to S3 via the /api/games/upload-photo endpoint.
 * Returns the S3 URL on success, or null on failure.
 */
export async function uploadImageToS3({
  file,
  userId,
  gameId,
  photoNumber,
  filename = 'image.jpg',
}: {
  file: File;
  userId?: string | number;
  gameId?: string | number;
  photoNumber?: string | number;
  filename?: string;
}): Promise<string | null> {
  const form = new FormData();
  form.append('file', file, filename);
  if (userId) form.append('userId', String(userId));
  if (gameId) form.append('gameId', String(gameId));
  if (photoNumber) form.append('photoNumber', String(photoNumber));
  const uploadRes = await fetch('/api/games/upload-photo', { method: 'POST', body: form });
  if (!uploadRes.ok) return null;
  const { url } = await uploadRes.json();
  return url;
}
