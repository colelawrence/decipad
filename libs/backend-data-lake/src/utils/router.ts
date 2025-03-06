/* eslint-disable no-await-in-loop */
import { match } from 'path-to-regexp';
import { Handler, User } from '@decipad/backendtypes';
import type { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { boomify, notFound } from '@hapi/boom';
import { getFirstPhrase } from './getFirstPhrase';

export interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: (
    req: APIGatewayProxyEvent,
    user: User | undefined,
    params: Record<string, string | string[] | undefined>
  ) => Promise<object | null>;
}

export const router = (routes: Route[]): Handler => {
  const matchRoutes = routes.map((r) => match(r.path));
  return async (req, user) => {
    let routeIndex = -1;
    for (const route of routes) {
      routeIndex += 1;
      if (route.method !== req.requestContext.http.method) {
        continue;
      }
      const matchRoute = matchRoutes[routeIndex];
      const result = matchRoute(req.rawPath);
      if (result) {
        // match
        try {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(await route.handler(req, user, result.params)),
          };
        } catch (e) {
          const error = boomify(e as Error);
          if (error.isServer) {
            throw error;
          }
          const {
            output: { payload },
          } = error;
          // eslint-disable-next-line no-console
          console.error(payload.message);
          payload.message = getFirstPhrase(payload.message);
          if (error.data) {
            payload.data = error.data;
          }
          // eslint-disable-next-line no-console
          console.warn('user error', payload);
          return {
            statusCode: payload.statusCode,
            body: JSON.stringify(payload),
          };
        }
      }
    }
    throw notFound('Route not found');
  };
};
