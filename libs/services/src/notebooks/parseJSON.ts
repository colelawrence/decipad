import Boom from '@hapi/boom';

export const parseJSON = (s: string) => {
  try {
    return JSON.parse(s);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('error parsing JSON', err);
    throw Boom.badRequest('Invalid JSON');
  }
};
