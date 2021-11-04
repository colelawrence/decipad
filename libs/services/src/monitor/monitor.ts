import { HttpResponse } from '@architect/functions';
import { boomify } from '@hapi/boom';
import { Context, Handler } from 'aws-lambda';
import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import { monitor as monitorConfig } from '@decipad/config';
import meta from '@decipad/meta';

interface WrapOptions {
  rethrow: boolean;
}

type HandlerReturnsPromise<T> = (req: T, ctx: Context) => Promise<HttpResponse>;

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

if (sentryDSN) {
  SentryAWSLambda.init({
    dsn: sentryDSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    release: meta().version,
  });
}

function handleError(_err: Error): HttpResponse {
  const err = boomify(_err as Error);
  if (!err.isServer) {
    return {
      statusCode: err.output.statusCode,
      body: JSON.stringify(err.output.payload),
      headers: err.output.headers as HttpResponse['headers'],
    };
  }
  throw err;
}

function handleUserErrors<T>(
  handler: Handler<T, HttpResponse>
): HandlerReturnsPromise<T> {
  return async (req, ctx) => {
    return new Promise<HttpResponse>((resolve): void => {
      try {
        // we need to support both callback and promise return styles
        const response = handler(req, ctx, (err, resp) => {
          if (err) {
            try {
              resolve(handleError(err as Error));
            } catch (err2) {
              resolve(handleError(err2 as Error));
            }
          }
          if (resp) {
            resolve(resp);
          }
        });
        if ((response as Promise<HttpResponse>)?.then) {
          resolve(response as Promise<HttpResponse>);
        }
      } catch (err) {
        resolve(handleError(err as Error));
      }
    });
  };
}

function printIfServerError<T>(
  handler: HandlerReturnsPromise<T>
): Handler<T, HttpResponse> {
  return async (req, ctx): Promise<HttpResponse> => {
    try {
      return (await handler(req, ctx)) as HttpResponse;
    } catch (_err) {
      const err = boomify(_err as Error);
      if (err.isServer) {
        // eslint-disable-next-line no-console
        console.error(err.output);
        throw err;
      }
      return {
        statusCode: err.output.statusCode,
        body: JSON.stringify(err.output.payload),
        headers: err.output.headers as HttpResponse['headers'],
      };
    }
  };
}

export function wrapHandler<T, R = void>(
  handler: Handler<T, R>,
  options: Partial<WrapOptions> = {}
) {
  const handle = printIfServerError(handleUserErrors(handler));
  if (sentryDSN) {
    const { rethrow = true } = options;
    return SentryAWSLambda.wrapHandler(handle, {
      rethrowAfterCapture: rethrow,
    });
  }
  return handle;
}
