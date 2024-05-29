import { inspect } from 'util';
import stringify from 'json-stringify-safe';
import { boomify } from '@hapi/boom';
import type {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyResultV2,
  ScheduledEvent,
  APIGatewayEventRequestContextV2,
  Handler,
} from 'aws-lambda';
import chalk from 'chalk';
import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import { captureException, trace } from '@decipad/backend-trace';
import { analyticsClient } from '@decipad/backend-analytics';
import type { Handler as MyHandler } from '@decipad/backendtypes';
import { getAuthenticatedUser } from '@decipad/services/authentication';
import { debug } from '../debug';
import {
  getErrorHeaders,
  isFullReturnObject,
  okStatusCodeFor,
  sanitizeErrorPayload,
} from '../common/http';

interface HandlerOptions {
  cors?: boolean;
}

type HttpHandler<
  TReqContext extends APIGatewayEventRequestContextV2 = APIGatewayEventRequestContextV2,
  TReq extends APIGatewayProxyEventV2WithRequestContext<TReqContext> = APIGatewayProxyEventV2WithRequestContext<TReqContext>,
  TRes extends APIGatewayProxyResultV2 = APIGatewayProxyResultV2
> = Handler<TReq, TRes>;

const wrapHandler = (
  handler: MyHandler,
  options: HandlerOptions = {}
): HttpHandler => {
  return trace(
    async (
      _req: APIGatewayProxyEvent | ScheduledEvent
    ): Promise<APIGatewayProxyResultV2> => {
      debug('request', _req);
      const req = _req as APIGatewayProxyEvent;
      try {
        if (
          'detail-type' in _req &&
          _req['detail-type'] === 'Scheduled Event'
        ) {
          return {
            statusCode: 200,
            headers: { 'content-type': 'application/json; charset=utf-8' },
            body: '',
          };
        }

        const user = await getAuthenticatedUser(req);
        if (user) {
          SentryAWSLambda.setUser({
            id: user.id,
            email: user.email ?? undefined,
          });
        }

        let body = await handler(req, user);
        if (isFullReturnObject(body)) {
          debug('response', body);
          return body;
        }

        let statusCode = okStatusCodeFor(req);
        const headers = {
          'content-type': 'application/json; charset=utf-8',
        };
        if (body == null) {
          statusCode = 404;
        } else if (typeof body !== 'string') {
          body = stringify(body);
        }

        const response = {
          statusCode,
          body: body ?? '',
          headers,
        };
        debug('response', response);

        return response;
      } catch (_err) {
        const err = boomify(_err as Error);
        if (err.isServer) {
          console.error('Error caught while processing request', _req);
          console.error((_err as Error).message);
          console.error((_err as Error).stack);
          console.log(_err);
          await captureException(err);
        } else {
          console.error(
            chalk.yellow(
              `User error caught while processing request:\n${inspect(
                _req
              )}\nErr:\n${inspect(err)}`
            )
          );
        }
        const reply = {
          statusCode: err.output.statusCode,
          headers: getErrorHeaders(err.output.headers, options),
          body: stringify(sanitizeErrorPayload(err.output.payload)),
        };
        console.error('Replying with', reply);
        return reply;
      } finally {
        const client = analyticsClient(req);
        if (client) {
          await client.closeAndFlush({ timeout: 2000 });
        }
      }
    }
  );
};

const utmKeys = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
] as const;

export const trackingUtmAndReferer = (handler: Handler): HttpHandler => {
  return async (event, ctx, cb) => {
    // track user id
    const user = await getAuthenticatedUser(event);
    const client = analyticsClient(event);
    if (client) {
      // track UTM params
      const params = event.queryStringParameters ?? {};
      for (const utmKey of utmKeys) {
        const value = params[utmKey];
        if (value) {
          client.recordProperty(utmKey, value);
        }
      }

      // track referer
      const { referer } = event.headers;
      if (referer) {
        client.recordProperty('$referrer', referer);
        try {
          const refUrl = new URL(referer);
          client.recordProperty('$referring_domain', refUrl.hostname);
        } catch (err) {
          console.error('Error parsing referrer', err);
        }
      }

      if (user) {
        client.myIdentify({ userId: user.id });
        client.identify({ userId: user.id });
      }
    }
    return handler(event, ctx, cb);
  };
};

const handle = (
  handler: MyHandler,
  options: HandlerOptions = {}
): HttpHandler => {
  return trackingUtmAndReferer(wrapHandler(handler, options));
};

export default handle;
