import S3 from 'aws-sdk/clients/s3';
import assert from 'assert';

const options = {
  endpoint:
    process.env.DECI_S3_ENDPOINT ||
    'localhost:4568',
  accessKeyId:
    process.env.DECI_S3_ACCESS_KEY_ID ||
    assert.fail('DECI_S3_ACCESS_KEY_ID env var must be defined'),
  secretAccessKey:
    process.env.DECI_S3_SECRET_ACCESS_KEY ||
    assert.fail('DECI_S3_SECRET_ACCESS_KEY env var must be defined'),
  sslEnabled: process.env.NODE_ENV !== 'testing',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
};

const Bucket =
  process.env.DECI_S3_PADS_BUCKET ||
  assert.fail('DECI_S3_PADS_BUCKET env var must be defined');

const s3 = new S3(options);

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
