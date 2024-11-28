/* eslint-disable no-restricted-properties */
import { s3 as s3Config } from '@decipad/backend-config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { isReadableStream } from 'is-stream';
import { getStreamAsBuffer } from 'get-stream';
import tables, { allPages } from '@decipad/tables';
import { getDefined } from '@decipad/utils';

const getUpdateFromFile = async (
  filePath: string
): Promise<Buffer | undefined> => {
  const { buckets, ...config } = s3Config();

  const Bucket = buckets.pads;
  const s3 = new S3Client(config);

  const command = new GetObjectCommand({
    Bucket,
    Key: filePath,
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

export type UpdateRecord = {
  id: string;
  seq: string;
  data: Uint8Array;
  data_file_path?: string;
};

export const getAllUpdateRecords = async (
  padId: string
): Promise<UpdateRecord[]> => {
  const data = await tables();
  const updates: UpdateRecord[] = [];
  for await (const docsyncUpdate of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': padId,
    },
    ConsistentRead: true,
  })) {
    if (docsyncUpdate) {
      if (docsyncUpdate.data) {
        updates.push({
          id: docsyncUpdate.id,
          seq: docsyncUpdate.seq,
          data: new Uint8Array(Buffer.from(docsyncUpdate.data, 'base64')),
        });
      } else if (docsyncUpdate.data_file_path) {
        updates.push({
          id: docsyncUpdate.id,
          seq: docsyncUpdate.seq,
          data_file_path: docsyncUpdate.data_file_path,
          data: new Uint8Array(
            getDefined(await getUpdateFromFile(docsyncUpdate.data_file_path))
          ),
        });
      }
    }
  }

  return updates;
};

export const getAllUpdates = async (padId: string): Promise<Uint8Array[]> => {
  return (await getAllUpdateRecords(padId)).map((r) => r.data);
};
