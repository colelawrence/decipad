import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import assert from 'assert';
import { HttpResponse } from '@architect/functions';
import NextAuthJWT from 'next-auth/jwt';
import tables from '@decipad/services/tables';
import { jwt as jwtConf } from '@decipad/services/authentication';
import timestamp from '../../common/timestamp';
import handle from '../handle';

const isSecureCookie =
  process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('https:');
const tokenCookieName = isSecureCookie
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export const handler = handle(
  async (event: APIGatewayProxyEvent): Promise<HttpResponse> => {
    if (!event.pathParameters?.userkeyvalidationid) {
      return {
        statusCode: 401,
      };
    }

    const data = await tables();
    const validation = await data.userkeyvalidations.get({
      id: event.pathParameters.userkeyvalidationid,
    });

    if (!validation) {
      return {
        statusCode: 404,
        body: 'Validation not found',
      };
    }

    const key = await data.userkeys.get({ id: validation.userkey_id });
    if (!key) {
      return {
        statusCode: 404,
        body: 'User key not found',
      };
    }

    key.validated_at = timestamp();
    await data.userkeys.put(key);

    await data.userkeyvalidations.delete({ id: validation.id });

    const user = await data.users.get({ id: key.user_id });
    if (!user) {
      return {
        statusCode: 404,
        body: 'User not found',
      };
    }

    assert(user.secret, 'user does not have a secret');
    const token = await NextAuthJWT.encode({
      ...jwtConf,
      token: { accessToken: user.secret },
    });
    let cookie = `${tokenCookieName}=${token}`;
    cookie += `; HttpOnly; Path=/; Max-Age=${jwtConf.maxAge}; SameSite=Strict`;
    if (isSecureCookie) {
      cookie += '; Secure';
    }

    if (event.queryStringParameters?.redirect === 'false') {
      return {
        statusCode: 201,
        headers: {
          'Set-Cookie': cookie,
        },
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: '/',
        'Set-Cookie': cookie,
      },
    };
  }
);
