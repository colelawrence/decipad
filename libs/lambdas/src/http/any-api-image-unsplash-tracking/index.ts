import { thirdParty } from '@decipad/backend-config';
import Boom from '@hapi/boom';
import axios from 'axios';
import handle from '../handle';

const { apiKey } = thirdParty().unsplash;

type RequestBody = {
  url: string;
};

export const handler = handle(async (event) => {
  const { body: requestBodyRaw } = event;
  let requestBodyString: string;

  if (event.isBase64Encoded && requestBodyRaw) {
    requestBodyString = Buffer.from(requestBodyRaw, 'base64').toString('utf8');
  } else if (requestBodyRaw) {
    requestBodyString = requestBodyRaw;
  } else {
    throw Boom.notFound(`Missing request body`);
  }

  let requestBody: RequestBody;
  try {
    requestBody = JSON.parse(requestBodyString);
  } catch (e) {
    throw Boom.badData('Request body is not valid JSON');
  }
  if (
    typeof requestBody.url !== 'string' ||
    !requestBody.url.startsWith('https://api.unsplash.com/photos/')
  ) {
    throw Boom.badData('Request body has wrong format. Expected `url`');
  }

  const { url } = requestBody;
  try {
    const response = await axios.get(`${url}?client_id=${apiKey}`);

    if (response.status !== 200) {
      throw Boom.internal(`${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    throw Boom.internal('Error fetching images', error);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ok: true }),
  };
});
