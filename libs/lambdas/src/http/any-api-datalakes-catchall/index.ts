import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { handler as backendDataLakeHandler } from '@decipad/backend-data-lake';
import handle from '../handle';

export const handler: APIGatewayProxyHandlerV2 = handle(backendDataLakeHandler);
