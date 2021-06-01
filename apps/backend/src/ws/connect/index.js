'use strict';

const tables = require('@architect/shared/tables');
const auth = require('@architect/shared/auth');
let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.decode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}

exports.handler = async function ws(event) {
  const { user, token, gotFromSecProtocolHeader } = await auth(event, {
    NextAuthJWT,
  });
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

  const reply = {
    statusCode: 200,
    headers: {
      'Sec-WebSocket-Protocol': gotFromSecProtocolHeader
        ? token
        : event.headers['sec-websocket-protocol'] ||
          event.headers['Sec-WebSocket-Protocol'],
    },
  };

  return reply;
};
