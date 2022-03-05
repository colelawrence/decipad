import asap from '@architect/asap';

const params = {
  cacheControl: 'max-age=0',
  sandboxPath: 'public',
  env: process.env.ARC_ENV || 'testing',
  spa: false,
};
exports.handler = asap(params);
