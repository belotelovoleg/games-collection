import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
// Utility to delete all objects under a prefix (folder)
export async function deleteGameImagesFromS3(userId: string, gameId: string): Promise<void> {
  const Bucket = process.env.S3_BUCKET_NAME!;
  const Prefix = `user/${userId}/games/${gameId}/`;
  // List all objects under the prefix
  const listedObjects = await s3.send(new ListObjectsV2Command({ Bucket, Prefix }));
  if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;
  // Prepare objects for deletion
  const deleteParams = {
    Bucket,
    Delete: {
      Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key! })),
      Quiet: true,
    },
  };
  await s3.send(new DeleteObjectsCommand(deleteParams));
}
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3({
  key,
  body,
  contentType,
  cacheControl = 'no-cache',
}: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl,
  }));
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}?v=${Date.now()}`;
}
