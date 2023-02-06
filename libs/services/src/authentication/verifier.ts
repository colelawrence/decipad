import { createHash } from 'crypto';
import tables from '@decipad/tables';
import { randomString } from '../utils/randomString';

interface AdapterOptions {
  secret: string;
  baseUrl: string;
}

interface VerificationRequest {
  identifier: string;
  token: string;
}

export const createVerifier = ({ secret, baseUrl }: AdapterOptions) => {
  function hashToken(token: string): string {
    return createHash('sha256').update(`${token}${secret}`).digest('hex');
  }

  return {
    async createVerificationToken(
      verification: VerificationRequest & { expires: Date }
    ) {
      const { identifier, expires, token } = verification;
      const data = await tables();
      const hashedToken = hashToken(token);

      const newVerificationRequest = {
        id: hashToken(`${identifier}:${hashedToken}`),
        identifier,
        token: hashedToken,
        expires: Math.round(expires.getTime() / 1000),
      };

      await data.verificationrequests.put(newVerificationRequest);

      return verification;
    },

    async createStandaloneVerificationToken({
      email,
      resourceLink,
      expirationSeconds,
    }: {
      email: string;
      resourceLink: string;
      expirationSeconds: number;
    }) {
      const token = randomString(32);
      const hashedToken = await hashToken(token);

      const verificationToken = await this.createVerificationToken({
        token: hashedToken,
        identifier: email,
        expires: new Date(Date.now() + 1000 * expirationSeconds),
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
        return {
          ...verificationRequest,
          expires: expirationDate,
        };
      }
      return null;
    },
  };
};
