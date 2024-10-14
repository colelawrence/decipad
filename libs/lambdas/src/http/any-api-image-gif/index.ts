/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable unused-imports/no-unused-vars */ import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import Boom from '@hapi/boom';
import axios from 'axios';
import handle from '../handle';

const { apiKey } = thirdParty().giphy;

type RequestBody = {
  prompt: string;
};

interface GiphyImage {
  images: {
    fixed_height: {
      url: string;
    };
  };
  url: string;
  user?: {
    username: string;
    profile_url: string;
  };
}

export const handler = handle(async (event) => {
  await expectAuthenticated(event);

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
  } catch (_e) {
    throw Boom.badData('Request body is not valid JSON');
  }
  if (typeof requestBody.prompt !== 'string') {
    throw Boom.badData('Request body has wrong format. Expected a `prompt`');
  }

  const { prompt } = requestBody;

  let images;

  try {
    const response = await axios.get(
      `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${prompt}&limit=50`
    );

    images = response.data.data.map((img: GiphyImage) => ({
      url: img.images.fixed_height.url,
      user: img.user && img.user.username ? img.user.username : 'Giphy',
      userProfile:
        img.user && img.user.profile_url ? img.user.profile_url : img.url,
    }));
  } catch (error) {
    throw Boom.internal('Error fetching images', error);
  }

  if (images.length < 1) {
    throw Boom.notFound(`Found no images`);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images,
    }),
  };
});
