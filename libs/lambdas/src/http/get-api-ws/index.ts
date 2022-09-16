import { getDefined } from '@decipad/utils';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async () => {
  const wssAddress = getDefined(
    process.env.ARC_WSS_URL,
    'need ARC_WSS_URL environment variable to be defined'
  );
  return {
    statusCode: 200,
    body: wssAddress,
  };
};
