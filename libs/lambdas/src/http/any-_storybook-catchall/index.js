import asap from '@architect/asap';

export const handler = async (req) => {
  if (req.path === '/.storybook') {
    return {
      statusCode: 301,
      headers: {
        location: '/.storybook/index.html',
      },
    };
  }
  const params = {
    cacheControl: 'max-age=0',
    sandboxPath: 'public',
    env: process.env.ARC_ENV || 'testing',
  };
  return asap(params)(req);
};
