const arc = require('@architect/functions');
let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.decode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}
const { decode: decodeJWT } = NextAuthJWT;

const jwtConf = require('@architect/shared/auth/jwt')({ NextAuthJWT });

exports.handler = async function ws(event) {
  const { user, token } = await auth(event);
  if (!user) {
    return {
      statusCode: 403,
    };
  }

  const tables = await arc.tables();
  await tables.connections.put({
    id: event.requestContext.connectionId,
    user_id: user.id,
  });

  return {
    statusCode: 200,
    headers: {
      'Sec-WebSocket-Protocol': token,
    },
  };
};

async function auth(event) {
  const token =
    event.headers['sec-websocket-protocol'] ||
    event.headers['Sec-WebSocket-Protocol'];
  let user = null;
  if (token) {
    try {
      const decoded = await decodeJWT({
        ...jwtConf,
        token,
      });
      if (decoded.accessToken) {
        const tables = await arc.tables();
        user = await tables.users.get({ id: decoded.accessToken });
      }
    } catch (err) {
      console.error(err.message);
      // do nothing
    }
  }

  return { user, token };
}
