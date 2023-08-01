import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3 as s3Config } from '@decipad/backend-config';

export const save = async (
  path: string,
  data: Buffer,
  contentType: string
): Promise<void> => {
  try {
    const { buckets, ...config } = s3Config();
    const Bucket = buckets.attachments;
    const s3 = new S3Client(config);

    const command = new PutObjectCommand({
      Bucket,
      Key: path,
      Body: data,
      ContentType: contentType,
    });
    await s3.send(command);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error saving file', err);
    throw err;
  }
};
