/* eslint-disable no-restricted-properties */
import tables from '@decipad/tables';
import { s3 as s3Config } from '@decipad/backend-config';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { UpdateRecord } from './updates';

const removeFile = async (path: string) => {
  try {
    const { buckets, ...config } = s3Config();
    const Bucket = buckets.pads;
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

export const removeUpdate = async (update: UpdateRecord) => {
  const data = await tables();
  if (update.data_file_path) {
    await removeFile(update.data_file_path);
  }
  await data.docsyncupdates.delete({ id: update.id, seq: update.seq });
};
