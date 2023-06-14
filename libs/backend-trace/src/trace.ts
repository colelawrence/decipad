import { AWSLambda as SentryAWSLambda } from '@sentry/serverless';
import {
  Context,
  Handler,
  APIGatewayProxyResultV2,
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayEventRequestContextV2,
} from 'aws-lambda';
import { boomify } from '@hapi/boom';
import { monitor as monitorConfig } from '@decipad/config';
import { getDefined } from '@decipad/utils';
import { captureException, initTrace, TraceOptions } from './captureException';

const {
  sentry: { dsn: sentryDSN },
} = monitorConfig();

const lastHandlerOptions = {
  rethrowAfterCapture: !!sentryDSN,
  callbackWaitsForEmptyEventLoop: false,
  captureTimeoutWarning: true,
};

const handleErrors = <
  TReqContext extends APIGatewayEventRequestContextV2 = APIGatewayEventRequestContextV2,
  TReq extends APIGatewayProxyEventV2WithRequestContext<TReqContext> = APIGatewayProxyEventV2WithRequestContext<TReqContext>,
  TRes extends APIGatewayProxyResultV2 = APIGatewayProxyResultV2
>(
  handle: Handler<TReq, TRes>
): Handler<TReq, TRes> =>
  SentryAWSLambda.wrapHandler(
    async (event: TReq, context: Context): Promise<TRes> => {
      try {
        const resp = await new Promise<TRes>((resolve, reject) => {
          const callback = (
            err?: Error | null | string | undefined,
            response?: TRes
          ) => {
            if (err) {
              return reject(err);
            }
            resolve(getDefined(response));
          };
          const r = handle(event, context, callback);
          if (r && r.then)
            r.then((result) => {
              if (result) {
                callback(null, result);
              }
            }).catch((err) => reject(err));
        });
        return resp;
      } catch (err) {
        const boomed = boomify(err as Error);
        if (boomed.isServer) {
          // eslint-disable-next-line no-console
          console.error('Error caught', err);
          await captureException(boomed);
        }
        return {
          statusCode: boomed.output.statusCode,
        } as TRes;
      }
    },
    lastHandlerOptions
  );

export const trace = <
  TReqContext extends APIGatewayEventRequestContextV2 = APIGatewayEventRequestContextV2,
  TReq extends APIGatewayProxyEventV2WithRequestContext<TReqContext> = APIGatewayProxyEventV2WithRequestContext<TReqContext>,
  TRes extends APIGatewayProxyResultV2 = APIGatewayProxyResultV2
>(
  handle: Handler<TReq, TRes>,
  options: TraceOptions = {}
): Handler<TReq, TRes> => {
  initTrace(options);
  return handleErrors(handle);
};
