/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable unused-imports/no-unused-vars */
import { thirdParty } from '@decipad/backend-config';
import { expectAuthenticated } from '@decipad/services/authentication';
import Boom from '@hapi/boom';
import axios from 'axios';
import handle from '../handle';

const { apiKey } = thirdParty().unsplash;

type RequestBody = {
  prompt: string;
};

interface UnsplashImage {
  urls: {
    small: string;
  };
  links: {
    download_location: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
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
    throw Boom.badData('Request body has wrong format. Expected `prompt`');
  }

  const { prompt } = requestBody;

  let images;

  try {
    const response = await axios.get(
      `https://api.unsplash.com/search/photos?client_id=${apiKey}&query=${prompt}&per_page=50`
    );

    images = response.data.results.map((img: UnsplashImage) => ({
      url: img.urls.small,
      user: img.user.name,
      userProfile: `${img.user.links.html}?utm_source=decipad&utm_medium=referral`,
      trackUrl: img.links.download_location,
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
