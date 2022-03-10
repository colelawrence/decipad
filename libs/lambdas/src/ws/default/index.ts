import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import { monitor as monitorConfig } from '@decipad/config';
import meta from '@decipad/meta';
import { onMessage } from '@decipad/sync-connection-lambdas';
import tables from '@decipad/tables';
import { noop } from '@decipad/utils';
import Boom from '@hapi/boom';
import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import { Context } from 'aws-lambda';
import { Buffer } from 'buffer';

type Handler = (req: WSRequest, ctx: Context) => Promise<HttpResponse>;

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

if (sentryDSN) {
  SentryAWSLambda.init({
    dsn: sentryDSN,
    tracesSampleRate: 0.001,
    environment: process.env.SENTRY_ENVIRONMENT,
    release: meta().version,
  });
}

function handleErrors(_handle: Handler) {
  const handle = SentryAWSLambda.wrapHandler(_handle);
  return async (event: WSRequest, context: Context): Promise<HttpResponse> => {
    try {
      const returnValue = await handle(event, context, noop);
      if (!returnValue) {
        return { statusCode: 200 };
      }
      return returnValue;
    } catch (err) {
      const error = Boom.boomify(err as Error);
      console.error('Error while receiving or sending WS message', err);
      return {
        statusCode: error.output.statusCode,
      };
    }
  };
}

export const handler = handleErrors(
  async (event: WSRequest): Promise<HttpResponse> => {
    const connId = event.requestContext.connectionId;
    if (!event.body) {
      // do nothing
      return { statusCode: 200 };
    }
    const data = await tables();
    const conn = await data.connections.get({ id: connId });
    if (!conn) {
      throw Boom.resourceGone();
    }

    const message = Buffer.from(event.body, 'base64');
    return onMessage(connId, message);
  }
);
