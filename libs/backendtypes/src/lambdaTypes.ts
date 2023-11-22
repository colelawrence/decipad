import type {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { type User } from './dataTypes';

export type Handler = (
  req: APIGatewayProxyEvent,
  user?: User
) => Promise<APIGatewayProxyStructuredResultV2 | string | undefined | void>;
