import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { authenticate } from '@decipad/services/authentication';
import { wrapHandler } from '@decipad/services/monitor';

export const handler = wrapHandler(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
  const { user, token, gotFromSecProtocolHeader } = await authenticate(event);
  if (!user) {
    return {
      statusCode: 403,
    };
  }

  const data = await tables();
  await data.connections.put({
    id: event.requestContext.connectionId,
    user_id: user.id,
  });

  const wsProtocol = gotFromSecProtocolHeader
    ? token
    : event.headers['sec-websocket-protocol'] ||
      event.headers['Sec-WebSocket-Protocol'];
  const reply = {
    statusCode: 200,
    headers: {
      'Sec-WebSocket-Protocol': wsProtocol!,
    },
  };

  return reply;
});
