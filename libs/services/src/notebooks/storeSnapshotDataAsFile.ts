import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3 as s3Config } from '@decipad/backend-config';

export const storeSnapshotDataAsFile = async (
  path: string,
  data: Buffer
): Promise<void> => {
  const { buckets, ...config } = s3Config();

  const Bucket = buckets.pads;
  const s3 = new S3Client(config);

  const command = new PutObjectCommand({
    Bucket,
    Key: path,
    Body: data,
    ContentType: 'application/x-deci-snapshot',
  });
  await s3.send(command);
};
