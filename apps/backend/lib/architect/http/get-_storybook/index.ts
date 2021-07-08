import { HttpHandler } from '@architect/functions';

export const handler: HttpHandler = async () => {
  return {
    statusCode: 301,
    headers: {
      location: '/.storybook/index.html',
    },
  };
};
