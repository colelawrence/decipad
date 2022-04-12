import { HttpResponse } from '@architect/functions';
import {
  authenticate,
  AuthResult,
  jwt as jwtConf,
} from '@decipad/services/authentication';
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import NextAuthJWT from 'next-auth/jwt';
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

function credentialHasUserOrSecret(cred: AuthResult): boolean {
  return !!cred.user || !!cred.secret;
}

export const handler = handle(
  async (event: APIGatewayProxyEvent): Promise<HttpResponse | string> => {
    const credentials = await authenticate(event);

    const firstCompleteCredential = credentials.find(credentialHasUserOrSecret);
    if (firstCompleteCredential && event.queryStringParameters?.for) {
      const purposeName = event.queryStringParameters.for;
      const purpose = purposes[purposeName];
      if (!purpose) {
        return {
          statusCode: 406,
          body: 'No such purpose',
        };
      }
      if (firstCompleteCredential.user && firstCompleteCredential.secret) {
        const token = await generateToken(
          firstCompleteCredential.secret,
          purpose
        );
        console.log('GENERATED NEW TOKEN:', token);
        return token;
      }
      if (firstCompleteCredential.secret) {
        return firstCompleteCredential.secret;
      }
    }
    return {
      statusCode: 403,
    };
  }
);

async function generateToken(
  secret: string,
  options: Partial<JWTEncodeParams>
): Promise<string> {
  return NextAuthJWT.encode({
    ...jwtConf,
    token: { accessToken: secret },
    ...options,
  });
}
