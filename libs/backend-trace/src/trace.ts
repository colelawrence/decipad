import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import { Context, Handler, APIGatewayProxyResultV2 } from 'aws-lambda';
import { boomify } from '@hapi/boom';
import { WSRequest } from '@decipad/backendtypes';
import { monitor as monitorConfig } from '@decipad/config';
import meta from '@decipad/meta';

type TraceOptions = Partial<{
  tracesSampleRate: number;
}>;

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

const sentryInitOptions = {
  dsn: sentryDSN,
  tracesSampleRate: 1,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: meta().version,
};

let sentryInitialized = false;

const lastHandlerOptions = {
  rethrowAfterCapture: !!sentryDSN,
  callbackWaitsForEmptyEventLoop: false,
  captureTimeoutWarning: true,
};

function handleErrors(handle: Handler): Handler {
  return SentryAWSLambda.wrapHandler(
    async (
      event: WSRequest,
      context: Context
    ): Promise<APIGatewayProxyResultV2> => {
      try {
        const resp = await new Promise((resolve, reject) => {
          const callback = (
            err: Error | null | string | undefined,
            response: APIGatewayProxyResultV2
          ) => {
            if (err) {
              return reject(err);
            }
            resolve(response);
          };
          const r = handle(event, context, callback);
          if (r && r.then)
            r.then((result) => {
              if (result) {
                callback(null, result);
              }
            }).catch((err) => reject(err));
        });
        return resp as APIGatewayProxyResultV2;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error caught', err);
        const error = boomify(err as Error);
        if (error.isServer) {
          SentryAWSLambda.captureException(error);
        }
        return {
          statusCode: error.output.statusCode,
        };
      }
    },
    lastHandlerOptions
  );
}

export const trace = (handle: Handler, options: TraceOptions = {}): Handler => {
  if (sentryDSN && !sentryInitialized) {
    SentryAWSLambda.init({ ...sentryInitOptions, ...options });
    sentryInitialized = true;
  }
  return handleErrors(handle);
};
