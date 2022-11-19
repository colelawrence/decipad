import S3 from 'aws-sdk/clients/s3';
import { s3 as s3Config } from '@decipad/config';

export const fetchSnapshotFromFile = async (
  path: string
): Promise<Buffer | undefined> => {
  const { buckets, ...config } = s3Config();
  const options: S3.Types.ClientConfiguration = {
    ...config,
    // @ts-expect-error Architect uses env name testing instead of the conventional test
    sslEnabled: process.env.NODE_ENV !== 'testing',
    s3ForcePathStyle: true,
  };

  const Bucket = buckets.pads;
  const s3 = new S3(options);

  const { Body: body } = await s3
    .getObject({
      Bucket,
      Key: path,
    })
    .promise();
  if (!body) {
    return undefined;
  }
  if (typeof body === 'string') {
    return Buffer.from(body, 'base64');
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }

  throw new Error(`unexpected s3 response body type: ${body}`);
};
