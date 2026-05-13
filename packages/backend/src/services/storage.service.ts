import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.storage.endpoint || undefined,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.storage.accessKey,
    secretAccessKey: config.storage.secretKey,
  },
});

interface UploadResult {
  key: string;
  url: string;
  sizeBytes: number;
}

/**
 * Upload a file to S3/R2
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const ext = filename.split('.').pop() || 'bin';
  const key = `${folder}/${uuidv4()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
    })
  );

  const url = config.storage.publicUrl
    ? `${config.storage.publicUrl}/${key}`
    : `${config.storage.endpoint}/${config.storage.bucket}/${key}`;

  logger.info('File uploaded', { key, sizeBytes: buffer.length, mimeType });

  return {
    key,
    url,
    sizeBytes: buffer.length,
  };
}

/**
 * Upload processed image (after Sharp processing)
 */
export async function uploadImage(
  buffer: Buffer,
  originalFilename: string,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<UploadResult> {
  const mimeMap = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const ext = format === 'jpeg' ? 'jpg' : format;
  const filename = originalFilename.replace(/\.[^.]+$/, `.${ext}`);

  return uploadFile(buffer, filename, mimeMap[format], 'images');
}

/**
 * Generate a presigned URL for direct upload
 */
export async function getPresignedUploadUrl(
  filename: string,
  mimeType: string,
  folder: string = 'uploads',
  expiresIn: number = 3600
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const ext = filename.split('.').pop() || 'bin';
  const key = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  const publicUrl = config.storage.publicUrl
    ? `${config.storage.publicUrl}/${key}`
    : `${config.storage.endpoint}/${config.storage.bucket}/${key}`;

  return { uploadUrl, key, publicUrl };
}

/**
 * Delete a file from S3/R2
 */
export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
    })
  );
  logger.info('File deleted', { key });
}

/**
 * Get a presigned URL for downloading
 */
export async function getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
