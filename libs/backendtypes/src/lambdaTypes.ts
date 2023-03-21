import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

export type Handler = (
  req: APIGatewayProxyEvent
) => Promise<APIGatewayProxyStructuredResultV2 | string | undefined | void>;
