import asap from '@architect/asap';

const serve = asap({
  cacheControl: 'max-age=0',
  sandboxPath: 'public',
  env: process.env.ARC_ENV || 'testing',
  alias: {
    '/.storybook': '/.storybook/index.html',
  },
});

export const handler = async (req) => {
  if (req.rawPath === '/.storybook') {
    return {
      statusCode: 301,
      headers: {
        location: '/.storybook/index.html',
      },
    };
  }
  try {
    return serve(req);
  } catch (err) {
    console.error('error serving ', req.path);
    throw err;
  }
};
