import {
  authenticate,
  AuthResult,
  jwt as jwtConf,
} from '@decipad/services/authentication';
import {
  APIGatewayProxyEventV2 as APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { encode } from 'next-auth/jwt';
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
  async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResultV2 | string> => {
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
        return token;
      }
      if (firstCompleteCredential.secret) {
        return firstCompleteCredential.secret;
      }
    }
    return 'guest';
  }
);

async function generateToken(
  secret: string,
  options: Partial<JWTEncodeParams>
): Promise<string> {
  return encode({
    ...jwtConf,
    token: { accessToken: secret },
    ...options,
  });
}
