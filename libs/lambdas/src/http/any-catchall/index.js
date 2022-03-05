import asap from '@architect/asap';

const params = {
  cacheControl: 'max-age=0',
  spa: true,
  sandboxPath: 'public',
  env: process.env.ARC_ENV || 'testing',
};
export const handler = asap(params);
