const tables = require('@architect/shared/tables');
let NextAuthJWT = require('next-auth/jwt');
if (typeof NextAuthJWT.decode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}
const { decode: decodeJWT } = NextAuthJWT;

const jwtConf = require('@architect/shared/auth-flow/jwt')({ NextAuthJWT });

exports.handler = async function ws(event) {
  const { user, token } = await auth(event);
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
        const data = await tables();
        user = await data.users.get({ id: decoded.accessToken });
      }
    } catch (err) {
      console.error(err.message);
      // do nothing
    }
  }

  return { user, token };
}
