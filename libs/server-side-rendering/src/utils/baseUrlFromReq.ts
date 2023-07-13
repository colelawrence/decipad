/* eslint-disable import/no-extraneous-dependencies */
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';

const hostFromReq = (req: APIGatewayProxyEvent) => {
  let { host } = req.headers;
  if (!host) {
    throw new Error('Need a host header');
  }
  if (host?.startsWith('localhost') && host.endsWith(':3333')) {
    host = 'localhost:3000';
  }
  return host;
};

export const baseUrlFromReq = (req: APIGatewayProxyEvent) => {
  // eslint-disable-next-line no-console
  const host = hostFromReq(req);
  return (host.startsWith('localhost') ? 'http://' : `https://`) + host;
};
