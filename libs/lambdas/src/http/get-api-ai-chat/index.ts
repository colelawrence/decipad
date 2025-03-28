/* eslint-disable camelcase */
import { services } from '@architect/functions';
import { getDefined } from '@decipad/utils';
import handle from '../handle';

const getChatLambdaURL = async () => {
  const { lambda_urls = {} } = (await services()) as {
    lambda_urls: Record<string, string>;
  };
  return getDefined(
    lambda_urls.AnyApiAiChatStreamHTTPLambda,
    'Could not find chat lambda URL in the services definitions'
  );
};

export const handler = handle(async () => {
  const chatStreamingURL = await getChatLambdaURL();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatStreamingURL,
    }),
  };
});
