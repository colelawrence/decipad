import { createHash } from 'crypto';
import tables from '@decipad/tables';
import type { VerificationRequestRecord } from '@decipad/backendtypes';
import { track } from '@decipad/backend-analytics';
import { randomString } from '../utils/randomString';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

interface AdapterOptions {
  secret: string;
  baseUrl: string;
  event: APIGatewayProxyEventV2;
}

interface VerificationRequest {
  identifier: string;
  token: string;
  openTokenForTestsOnly?: string;
}

export const createVerifier = ({ secret, baseUrl, event }: AdapterOptions) => {
  function hashToken(token: string): string {
    return createHash('sha256').update(`${token}${secret}`).digest('hex');
  }

  return {
    hashToken,
    async createVerificationToken(
      verification: VerificationRequest & {
        expires: Date;
        resourceLink?: string;
      }
    ) {
      const { identifier, expires, token, resourceLink } = verification;
      const data = await tables();
      const hashedToken = hashToken(token);

      const newVerificationRequest: VerificationRequestRecord = {
        id: hashToken(`${identifier}:${hashedToken}`),
        identifier,
        token: hashedToken,

        expires: Math.round(expires.getTime() / 1000),
        resourceLink,
        ...(process.env.NODE_ENV === 'production'
          ? {}
          : {
              openTokenForTestsOnly: verification.openTokenForTestsOnly,
            }),
      };

      await data.verificationrequests.put(newVerificationRequest);

      return verification;
    },

    async createStandaloneVerificationToken(verification: {
      email: string;
      resourceLink: string;
      expirationSeconds: number;
    }) {
      const { email, resourceLink, expirationSeconds } = verification;
      const token = randomString(32);
      const hashedToken = await hashToken(token);

      const verificationToken = await this.createVerificationToken({
        token: hashedToken,
        identifier: email,
        expires: new Date(Date.now() + 1000 * expirationSeconds),
        resourceLink,
        ...(process.env.NODE_ENV === 'production'
          ? {}
          : {
              openTokenForTestsOnly: token,
            }),
      });

      const loginLink = `${baseUrl}/api/auth/callback/email?callbackUrl=${encodeURIComponent(
        resourceLink
      )}&token=${token}&email=${encodeURIComponent(email)}`;

      return {
        loginLink,
        verificationToken,
      };
    },

    async useVerificationToken(verification: VerificationRequest) {
      const { identifier, token } = verification;
      const data = await tables();
      const hashedToken = hashToken(token);
      const id = hashToken(`${identifier}:${hashedToken}`);

      const verificationRequest = await data.verificationrequests.get({ id });

      if (verificationRequest) {
        const expirationDate = new Date(verificationRequest.expires * 1000);
        if (expirationDate.getTime() <= Date.now()) {
          if (verificationRequest.resourceLink) {
            await track(event, {
              event: 'accepted invitation',
              properties: {
                identifier: verificationRequest.identifier,
                resourceLink: verificationRequest.resourceLink,
              },
            });
          }
        }
        return {
          ...verificationRequest,
          expires: expirationDate,
        };
      }
      return null;
    },
  };
};
