import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 as s3Config } from '@decipad/backend-config';
import { isReadableStream } from 'is-stream';
import { getStreamAsBuffer } from 'get-stream';

export const fetchSnapshotFromFile = async (
  path: string
): Promise<Buffer | undefined> => {
  const { buckets, ...config } = s3Config();

  const Bucket = buckets.pads;
  const s3 = new S3Client(config);

  const command = new GetObjectCommand({
    Bucket,
    Key: path,
  });
  const { Body: body } = await s3.send(command);
  if (!body) {
    return undefined;
  }
  if (typeof body === 'string') {
    return Buffer.from(body, 'base64');
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (isReadableStream(body)) {
    return getStreamAsBuffer(body);
  }

  throw new Error(`unexpected s3 response body type: ${body}`);
};
