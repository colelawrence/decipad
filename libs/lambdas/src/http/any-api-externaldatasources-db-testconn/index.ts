/* eslint-disable prefer-destructuring */
import { pingDatabase } from '@decipad/backend-external-db';
import Boom from '@hapi/boom';
import handle from '../handle';

export const handler = handle(async (event) => {
  let body = event.body;
  if (event.isBase64Encoded && body) {
    body = Buffer.from(body, 'base64').toString('utf8');
  }

  if (!body) {
    throw Boom.badData('Body should be a string containing the full db url.');
  }

  const res = await pingDatabase(body);

  if (!res.ok) {
    throw Boom.badData(res.error);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  };
});
