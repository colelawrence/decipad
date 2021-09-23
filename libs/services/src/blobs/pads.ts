/* eslint-disable no-console */
import { nanoid } from 'nanoid';
// eslint-disable-next-line import/no-extraneous-dependencies
import S3 from 'aws-sdk/clients/s3';
import { ID } from '@decipad/backendtypes';
import { s3 as s3Config } from '@decipad/config';

interface ErrorWithStatsCode extends Error {
  statusCode?: number;
  code: string;
}

export async function duplicate(
  oldId: ID,
  oldVersion: number,
  newId: ID
): Promise<void> {
  const [client, Bucket] = clientAndBucket();
  const CopySource = `/${Bucket}/${encodeURIComponent(
    encodeId(oldId, oldVersion)
  )}`;
  const newVersion = 1;
  const options = {
    Bucket,
    Key: encodeId(newId, newVersion),
    CopySource,
  };

  await client.copyObject(options).promise();
}

export async function putTemp(id: ID, content: string): Promise<string> {
  const [client, Bucket] = clientAndBucket();
  const Body = Buffer.from(content, 'utf-8');
  const version = nanoid();
  const Key = encodeTemp(id, version);

  const options = {
    Bucket,
    Key,
    Body,
  };

  try {
    await client.putObject(options).promise();
    return Key;
  } catch (err) {
    console.error('error putting temporary object in s3:', err);
    console.log('putObject options were:', options);
    throw err;
  }
}

export async function commit(
  tempSourcePath: string,
  targetId: string,
  version: number
): Promise<void> {
  const [client, Bucket] = clientAndBucket();

  const copOptions = {
    Bucket,
    Key: encodeId(targetId, version),
    CopySource: `/${Bucket}/${encodeURIComponent(tempSourcePath)}`,
  };
  try {
    await client.copyObject(copOptions).promise();
  } catch (err) {
    console.error('Error commiting copying file in S3', err);
    console.error('copyObject options were:', copOptions);
    throw err;
  }

  const deleteOptions = {
    Bucket,
    Key: tempSourcePath,
  };
  try {
    await client.deleteObject(deleteOptions).promise();
  } catch (err) {
    console.error('Error deleting file from S3', err);
    console.error('deleteObject ptions were:', deleteOptions);
    throw err;
  }
}

export async function put(
  id: ID,
  version: number,
  content: string
): Promise<void> {
  const [client, Bucket] = clientAndBucket();
  const Body = Buffer.from(content, 'utf-8');
  const Key = encodeId(id, version);
  const options = {
    Bucket,
    Key,
    Body,
  };
  try {
    await client.putObject(options).promise();
  } catch (err) {
    console.error('Unexpected error putting s3 object', err);
    console.log('options were:', options);
    throw err;
  }
}

export async function get(id: ID, version: number): Promise<string | null> {
  const [client, Bucket] = clientAndBucket();
  const options = {
    Bucket,
    Key: encodeId(id, version),
  };
  try {
    const data = await client.getObject(options).promise();
    return data?.Body ? data.Body.toString('utf-8') : null;
  } catch (_err) {
    const err = _err as ErrorWithStatsCode;
    console.error('S3 error:', _err);
    console.error('S3 getObject options were', options);
    const notFound =
      err.statusCode === 404 ||
      err.statusCode === 403 ||
      err.code === 'NoSuchKey';
    console.log('error interpreted as not found: %j', notFound);
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

function encodeTemp(id: string, random: string): string {
  return `temp/${encodeId(id, random)}`;
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
