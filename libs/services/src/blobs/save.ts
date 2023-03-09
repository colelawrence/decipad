import S3 from 'aws-sdk/clients/s3';
import { s3 as s3Config } from '@decipad/config';

export const save = async (
  path: string,
  data: Buffer,
  contentType: string
): Promise<void> => {
  const { buckets, ...config } = s3Config();
  const options = {
    ...config,
    // @ts-expect-error Architect uses env name testing instead of the conventional test
    sslEnabled: process.env.NODE_ENV !== 'testing',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  };

  const Bucket = buckets.attachments;
  const s3 = new S3(options);

  await s3
    .putObject({
      Bucket,
      Key: path,
      Body: data,
      ContentType: contentType,
    })
    .promise();
};
