import tables from '@decipad/tables';
import { nanoid } from 'nanoid';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3 as s3Config } from '@decipad/backend-config';
import { updateFilePath } from './updateFilePath';
import { getDefined } from '@decipad/utils';
import { MAX_RECORD_SIZE_BYTES } from './constants';

const storeUpdateAsFile = async (
  padId: string,
  seq: string,
  update: Uint8Array
) => {
  const path = updateFilePath(padId, seq);
  const { buckets, ...config } = s3Config();

  const Bucket = buckets.pads;
  const s3 = new S3Client(config);

  const command = new PutObjectCommand({
    Bucket,
    Key: path,
    Body: update,
    ContentType: 'application/x-deci-snapshot',
  });
  try {
    await s3.send(command);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error storing update as file', error);
    throw error;
  }
  return path;
};

/* eslint-disable no-restricted-properties */
export const createUpdate = async (
  padId: string,
  update: Uint8Array,
  notif?: boolean | number
) => {
  const data = await tables();
  const encoded = Buffer.from(update).toString('base64');
  const seq = `${Date.now()}:${Math.floor(Math.random() * 10000)}:${nanoid()}`;
  const inlineData = encoded.length <= MAX_RECORD_SIZE_BYTES;
  let dataFilePath: string | undefined;
  if (!inlineData) {
    dataFilePath = await storeUpdateAsFile(padId, seq, update);
  }
  await data.docsyncupdates.put(
    {
      id: padId,
      seq: `${Date.now()}:${Math.floor(Math.random() * 10000)}:${nanoid()}`,
      ...(inlineData
        ? {
            data: encoded,
          }
        : {
            data_file_path: getDefined(dataFilePath),
          }),
    },
    notif
  );
};
