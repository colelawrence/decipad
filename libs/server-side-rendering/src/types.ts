/* eslint-disable import/no-extraneous-dependencies */
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
  Context,
  Callback,
} from 'aws-lambda';

export type Request = APIGatewayProxyEvent;
export type Response = APIGatewayProxyStructuredResultV2;

export type Handler = (
  req: Request,
  context: Context,
  callback: Callback
) => void | Promise<Response>;
