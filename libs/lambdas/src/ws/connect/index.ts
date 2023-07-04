import {
  authenticate,
  isValidAuthResult,
} from '@decipad/services/authentication';
import { onConnect } from '@decipad/sync-connection-lambdas';
import { getDefined } from '@decipad/utils';
import { trace } from '@decipad/backend-trace';
import Boom, { boomify } from '@hapi/boom';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import EventEmitter from 'events';
import { resource } from '@decipad/backend-resources';
import { docIdFromPath } from '../path';
import { TWSRequestEvent } from '../../types';

EventEmitter.defaultMaxListeners = 1000;

const notebooks = resource('notebook');

const handle: APIGatewayProxyHandlerV2 = async (event: TWSRequestEvent) => {
  try {
    const authResult = (await authenticate(event)).filter(isValidAuthResult);

    const connId = getDefined(event.requestContext.connectionId);
    const qs = getDefined(event.queryStringParameters);
    const docId = docIdFromPath(qs.doc || '');
    if (!docId) {
      throw Boom.notAcceptable('no doc id');
    }
    const protocol = qs.protocol ? Number(qs.protocol) : 1;
    if (Number.isNaN(protocol) || protocol < 1 || protocol > 2) {
      throw new Error(`Invalid protocol version ${protocol}`);
    }
    const resources = await notebooks.getResourceIds(docId);
    const versionName = qs.version ?? '';
    await onConnect({
      connId,
      resources,
      versionName,
      auth: authResult,
      protocol,
    });

    const wsProtocol =
      event.headers['sec-websocket-protocol'] ||
      event.headers['Sec-WebSocket-Protocol'];

    return {
      statusCode: 200,
      headers: wsProtocol
        ? {
            'Sec-WebSocket-Protocol': getDefined(wsProtocol),
          }
        : undefined,
    };
  } catch (err) {
    const e = boomify(err as Error);
    if (e.isServer) {
      console.error('Error on connect:', e);
      console.error('headers:', event.headers);
    }
    return {
      statusCode: e.output.statusCode,
    };
  }
};

export const handler: APIGatewayProxyHandlerV2 = trace(handle);
