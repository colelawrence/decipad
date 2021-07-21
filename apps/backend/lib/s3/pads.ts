import S3 from 'aws-sdk/clients/s3';
import { s3 as s3Config } from '../config';

const { buckets, ...config } = s3Config();
const options = {
  ...config,
  sslEnabled: process.env.NODE_ENV !== 'testing',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
};
const Bucket = buckets.pads;
const s3 = new S3(options);

export function duplicate(id: ID, oldID: ID): Promise<void> {
  const CopySource =
    '/' + Bucket + '/' + encodeId(`/pads/${encodeId(oldID)}/content`);
  const options = {
    Bucket,
    Key: encodeId(`/pads/${encodeId(id)}/content`),
    CopySource,
  };

  return s3
    .copyObject(options)
    .promise()
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 403) {
        return null;
      }
      console.log(`Error copying ${id}:`, err);
      throw err;
    })
    .then(() => {
      return;
    });
}

export function put(id: ID, _body: string): Promise<any> {
  const Body = Buffer.from(_body, 'utf-8');
  const Key = encodeId(id);
  const options = {
    Bucket,
    Key,
    Body,
  };
  return s3
    .putObject(options)
    .promise()
    .catch((err) => {
      console.log(`Error putting ${id} in ${Bucket}:`, err);
      throw err;
    });
}

export function get(id: ID): Promise<string | null> {
  const options = {
    Bucket,
    Key: encodeId(id),
  };
  return s3
    .getObject(options)
    .promise()
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 403) {
        return null;
      }
      console.log(`Error getting ${id}:`, err);
      throw err;
    })
    .then((data) => {
      return data?.Body ? data.Body.toString('utf-8') : null;
    });
}

export async function remove(id: ID): Promise<void> {
  await s3
    .deleteObject({
      Bucket,
      Key: encodeId(id),
    })
    .promise();
}

function encodeId(id: string): string {
  return encodeURIComponent(id);
}
