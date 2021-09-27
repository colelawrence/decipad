/* eslint-disable no-console */
import { nanoid } from 'nanoid';
import Boom from '@hapi/boom';
// eslint-disable-next-line import/no-extraneous-dependencies
import S3 from 'aws-sdk/clients/s3';
import { ID } from '@decipad/backendtypes';
import { s3 as s3Config } from '@decipad/config';
import tables from '@decipad/services/tables';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code: string;
}

export async function duplicate(
  oldId: ID,
  oldVersion: number,
  newId: ID,
  encode = true
): Promise<void> {
  const data = await tables();
  const docSync = await data.docsync.get({ id: oldId });
  if (!docSync || !docSync.path) {
    throw Boom.notFound('no doc sync');
  }
  const { path } = docSync;
  const [client, Bucket] = clientAndBucket();
  const CopySource = `/${Bucket}/${encode ? encodeURIComponent(path) : path}`;
  const newKey = encodeId(newId, nanoid());
  const options = {
    Bucket,
    Key: newKey,
    CopySource,
  };

  try {
    await client.copyObject(options).promise();
    await data.docsync.put({ id: newId, _version: 1, path: newKey });
  } catch (err) {
    if ((err as ErrorWithStatusCode).code === 'NoSuchKey' && encode) {
      await duplicate(oldId, oldVersion, newId, false);
      return;
    }
    console.error('error duplicating object in s3:', err);
    console.log('copyObject options were:', options);
    throw err;
  }
}

export async function put(id: ID, content: string): Promise<string> {
  const [client, Bucket] = clientAndBucket();
  const Body = Buffer.from(content, 'utf-8');
  const random = nanoid();
  const Key = encodeId(id, random);
  const options = {
    Bucket,
    Key,
    Body,
  };
  try {
    await client.putObject(options).promise();
    return Key;
  } catch (err) {
    console.error('Unexpected error putting s3 object', err);
    console.log('options were:', options);
    throw err;
  }
}

export async function get(path: string): Promise<string | null> {
  const [client, Bucket] = clientAndBucket();
  const options = {
    Bucket,
    Key: path,
  };
  try {
    const data = await client.getObject(options).promise();
    return data?.Body ? data.Body.toString('utf-8') : null;
  } catch (_err) {
    const err = _err as ErrorWithStatusCode;
    console.error('S3 error:', _err);
    console.error('S3 getObject options were', options);
    const notFound =
      err.statusCode === 404 ||
      err.statusCode === 403 ||
      err.code === 'NoSuchKey';
    if (notFound) {
      return null;
    }
    throw err;
  }
}

export async function remove(id: ID, version: number): Promise<void> {
  const [client, Bucket] = clientAndBucket();
  const options = {
    Bucket,
    Key: encodeId(id, version),
  };
  try {
    await client.deleteObject(options).promise();
  } catch (err) {
    console.error('error removing file form s3:', err);
    console.log('deleteObject options were', options);
    throw err;
  }
}

function encodeId(id: string, version: number | string): string {
  return encodeURIComponent([id, version.toString()].join(':'));
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
