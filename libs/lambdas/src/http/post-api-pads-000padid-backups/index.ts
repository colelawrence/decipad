import { resource } from '@decipad/backend-resources';
import Boom from '@hapi/boom';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import handle from '../handle';
import { s3 as s3Config } from '@decipad/backend-config';
import tables from '@decipad/tables';
import { nanoid } from 'nanoid';

const notebooks = resource('notebook');

export const handler = handle(async (event, user) => {
  const data = await tables();
  const padId = event.pathParameters?.padid;
  if (!padId) {
    throw Boom.notAcceptable('missing parameters');
  }
  if (!user) {
    throw Boom.unauthorized('User not authenticated');
  }
  const userAgent = event.headers['user-agent'];

  // Check that the user is authorised to access this pad
  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });

  const sessionTokenCookie = event.cookies?.find((cookie) => {
    return cookie.startsWith('docsync_session_token=');
  });
  if (!sessionTokenCookie) {
    throw Boom.notAcceptable('missing session cookie');
  }
  const sessionToken = sessionTokenCookie.split('=')[1];

  const { body: requestBodyRaw } = event;
  let requestBodyString: string;

  if (event.isBase64Encoded && requestBodyRaw) {
    requestBodyString = Buffer.from(requestBodyRaw, 'base64').toString('utf8');
  } else if (requestBodyRaw) {
    requestBodyString = requestBodyRaw;
  } else {
    throw Boom.notFound(`Missing request body`);
  }
  let document;
  try {
    document = JSON.parse(requestBodyString);
  } catch (e) {
    throw Boom.internal('Request body not valid JSON.');
  }

  // save to S3
  const { buckets, ...config } = s3Config();
  const Bucket = buckets.padBackups;
  const s3 = new S3Client(config);

  const datetimeObject = new Date();
  const datetime = datetimeObject.toISOString();
  const key = `${padId}_${datetime}`;
  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: requestBodyString,
    ContentType: 'application/x-deci-snapshot',
  });
  await s3.send(command);

  // save to dynamo
  await data.userbackups.create({
    id: nanoid(),
    pad_id: padId,
    user_id: user.id,
    file_name: key,
    datetime,
    session_token: sessionToken,
    user_agent: userAgent || 'unknown',
    expires_at: datetimeObject.getTime() / 1000 + 90 * 24 * 60 * 60, // 90 days
  });

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ key, document }),
  };
});
