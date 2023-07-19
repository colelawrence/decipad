/* eslint-disable prefer-destructuring */
import Boom from '@hapi/boom';
import { pingDatabase } from '@decipad/backend-external-db';
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
  return {
    statusCode: res.ok ? 200 : 400,
    headers: {
      'Content-Type': 'application/json',
    },
  };
});
