/* eslint-disable no-console */
import S3 from 'aws-sdk/clients/s3';
import { ID } from '@decipad/backendtypes';
import { s3 as s3Config } from '@decipad/config';

export function duplicate(id: ID, oldID: ID): Promise<void> {
  const [client, Bucket] = clientAndBucket();
  const CopySource = `/${Bucket}/${encodeId(
    `/pads/${encodeId(oldID)}/content`
  )}`;
  const options = {
    Bucket,
    Key: encodeId(`/pads/${encodeId(id)}/content`),
    CopySource,
  };

  return client
    .copyObject(options)
    .promise()
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 403) {
        return null;
      }
      console.log(`Error copying ${id}:`, err);
      throw err;
    })
    .then(() => undefined);
}

export function put(id: ID, _body: string): Promise<unknown> {
  const [client, Bucket] = clientAndBucket();
  const Body = Buffer.from(_body, 'utf-8');
  const Key = encodeId(id);
  const options = {
    Bucket,
    Key,
    Body,
  };
  return client
    .putObject(options)
    .promise()
    .catch((err) => {
      console.log(`Error putting ${id} in ${Bucket}:`, err);
      throw err;
    });
}

export function get(id: ID): Promise<string | null> {
  const [client, Bucket] = clientAndBucket();
  const options = {
    Bucket,
    Key: encodeId(id),
  };
  return client
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
  const [client, Bucket] = clientAndBucket();
  await client
    .deleteObject({
      Bucket,
      Key: encodeId(id),
    })
    .promise();
}

function encodeId(id: string): string {
  return encodeURIComponent(id);
}

function clientAndBucket(): [S3, string] {
  const { buckets, ...config } = s3Config();
  const options = {
    ...config,
    sslEnabled: process.env.NODE_ENV !== 'testing',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  };
  const Bucket = buckets.pads;
  return [new S3(options), Bucket];
}
