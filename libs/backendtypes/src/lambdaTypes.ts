import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { type User } from './dataTypes';

export type Handler = (
  req: APIGatewayProxyEventV2,
  user?: User
) => Promise<APIGatewayProxyStructuredResultV2 | string | undefined | void>;
