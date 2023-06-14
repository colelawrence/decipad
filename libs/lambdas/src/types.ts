import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
} from 'aws-lambda';

export * from '@decipad/backendtypes';

export type TWSRequestContext = APIGatewayEventRequestContextV2 & {
  connectionId?: string;
};

export type TWSRequestEvent =
  APIGatewayProxyEventV2WithRequestContext<TWSRequestContext>;
