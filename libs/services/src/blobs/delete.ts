import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3 as s3Config } from '@decipad/backend-config';

export const deleteBlob = async (path: string): Promise<void> => {
  try {
    const { buckets, ...config } = s3Config();
    const Bucket = buckets.attachments;
    const s3 = new S3Client(config);

    const command = new DeleteObjectCommand({
      Bucket,
      Key: path,
    });
    await s3.send(command);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deleting file', err);
    throw err;
  }
};
