import { HttpHandler } from '@architect/functions';
import { getDefined } from '@decipad/utils';

export const handler: HttpHandler = async () => {
  const wssAddress = getDefined(
    process.env.ARC_WSS_URL,
    'need ARC_WSS_URL environment variable to be defined'
  );
  return {
    statusCode: 200,
    body: wssAddress,
  };
};
