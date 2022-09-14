import {
  authenticate,
  AuthResult,
  jwt as jwtConf,
} from '@decipad/services/authentication';
import { UserInputError } from 'apollo-server-lambda';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { encode, JWTEncodeParams } from 'next-auth/jwt';

const credentialHasUserOrSecret = (cred: AuthResult) =>
  !!cred.user || !!cred.secret;

const generateToken = async (
  secret: string,
  options: Partial<JWTEncodeParams>
): Promise<string> => {
  return encode({
    ...jwtConf,
    token: { accessToken: secret },
    ...options,
  });
};

export type Purpose = 'pubsub';

const purposes: Record<Purpose, Partial<JWTEncodeParams>> = {
  pubsub: {
    maxAge: 5 * 60, // 5 minutes
  },
};

export const accessTokenFor = async (
  event: APIGatewayProxyEventV2,
  purposeName: Purpose
): Promise<string> => {
  const credentials = await authenticate(event);
  const firstCompleteCredential = credentials.find(credentialHasUserOrSecret);
  if (firstCompleteCredential) {
    const purpose = purposes[purposeName];
    if (!purpose) {
      throw new UserInputError(`Invalid purpose "${purposeName}"`);
    }
    if (firstCompleteCredential.user && firstCompleteCredential.secret) {
      return generateToken(firstCompleteCredential.secret, purpose);
    }
    if (firstCompleteCredential.secret) {
      return firstCompleteCredential.secret;
    }
  }
  return 'guest';
};
