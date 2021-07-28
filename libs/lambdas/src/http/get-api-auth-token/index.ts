import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import { HttpResponse } from '@architect/functions';
import NextAuthJWT from 'next-auth/jwt';
import { authenticate, jwt as jwtConf } from '@decipad/services/authentication';
import handle from '../handle';

interface DefaultJWT extends Record<string, unknown> {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
}

interface JWT extends Record<string, unknown>, DefaultJWT {}

interface JWTEncodeParams {
  token?: JWT;
  maxAge?: number;
  secret: string | Buffer;
  signingKey?: string;
  encryptionKey?: string;
  encryptionOptions?: Record<string, unknown>;
  encryption?: boolean;
}

const purposes: Record<string, Partial<JWTEncodeParams>> = {
  pubsub: {
    maxAge: 5 * 60, // 5 minutes
  },
};

export const handler = handle(async (event: APIGatewayProxyEvent): Promise<
  HttpResponse | string
> => {
  const { user, secret } = await authenticate(event);

  if (user && event.queryStringParameters?.for) {
    const purposeName = event.queryStringParameters.for;
    const purpose = purposes[purposeName];
    if (!purpose) {
      return {
        statusCode: 406,
        body: 'No such purpose',
      };
    }
    return await generateToken(secret!, purpose);
  } else {
    return {
      statusCode: 403,
    };
  }
});

async function generateToken(
  secret: string,
  options: Partial<JWTEncodeParams>
): Promise<string> {
  return await NextAuthJWT.encode({
    ...jwtConf,
    token: { accessToken: secret },
    ...options,
  });
}
