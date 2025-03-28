/* eslint-disable camelcase */
import { ResponseStream } from 'lambda-stream';
import { OutgoingHttpHeader, ServerResponse } from 'http';
import { OutgoingHttpHeaders } from 'http2';

export const enhanceResponseStream = (
  responseStream: ResponseStream,
  responseMetadata: {
    statusCode: number;
    statusMessage?: string;
    headers?: string | OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined;
  }
): ServerResponse => {
  Object.assign(responseStream, {
    statusCode: 200,
    statusMessage: 'OK',
    writeHead(
      statusCode: number,
      statusMessage?:
        | string
        | OutgoingHttpHeaders
        | OutgoingHttpHeader[]
        | undefined,
      headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined
    ) {
      responseMetadata.statusCode = statusCode;
      if (typeof statusMessage === 'string') {
        responseMetadata.statusMessage = statusMessage;
      } else {
        responseMetadata.headers = statusMessage;
      }
      if (headers) {
        responseMetadata.headers = headers;
      }
      return responseStream as unknown as ServerResponse;
    },
  } as ServerResponse);
  return responseStream as unknown as ServerResponse;
};
