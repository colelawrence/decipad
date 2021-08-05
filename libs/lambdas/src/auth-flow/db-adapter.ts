import { createHash } from 'crypto';
import {
  User,
  UserRecord,
  UserInput,
  VerificationRequestRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { create as createUser2 } from '@decipad/services/users';
import timestamp from '../common/timestamp';

// Next-Auth does not expose some types
// So we have to help here.
type AdapterOptions = {
  secret: string;
  baseUrl: string;
};

type SendVerificationRequest = (params: {
  identifier: string;
  url: string;
  baseUrl: string;
  token: string;
  provider: EmailConfig;
}) => Promise<void>;

type EmailConfig = {
  sendVerificationRequest: SendVerificationRequest;
};

export default function createAdapter() {
  async function getAdapter(options: AdapterOptions) {
    const { secret: secretOption, ...appOptions } = options;
    const data = await tables();

    async function createUser(profile: any) {
      return createUser2(profile as UserInput);
    }

    async function getUser(id: string): Promise<User | undefined> {
      return data.users.get({ id });
    }

    async function getUserByEmail(email: string): Promise<User | undefined> {
      const key = await data.userkeys.get({ id: `email:${email}` });
      let user;
      if (key) {
        user = await data.users.get({ id: key.user_id });
      }

      return user;
    }

    async function getUserByProviderAccountId(
      providerId: string,
      providerAccountId: string
    ): Promise<User | undefined> {
      const userkey = await data.userkeys.get({
        id: `${providerId}:${providerAccountId}`,
      });
      let user;
      if (userkey) {
        user = await data.users.get({ id: userkey.user_id });
      }

      return user;
    }

    async function updateUser(user: UserRecord & { emailVerified?: Date }) {
      if (user.emailVerified) {
        const verifiedAt = new Date(user.emailVerified);
        const userkey = await data.userkeys.get({
          id: `email:${user.email}`,
        });

        if (userkey) {
          userkey.validated_at = verifiedAt.getTime();

          await data.userkeys.put(userkey);
        }
      }

      const previousUser = data.users.get({ id: user.id });
      const newUser = Object.assign(previousUser, user) as User;
      await data.users.put(user);
      return newUser;
    }

    async function deleteUser() {
      return null;
    }

    async function linkAccount(
      userId: string,
      providerId: string,
      providerType: string,
      providerAccountId: string,
      refreshToken: string,
      accessToken: string,
      accessTokenExpires: Date
    ) {
      // already linked, you don't have to do a thing
      console.log('linkAccount', {
        userId,
        providerId,
        providerType,
        providerAccountId,
        refreshToken,
        accessToken,
        accessTokenExpires,
      });
      return Promise.resolve(true);
    }

    async function unlinkAccount(
      userId: string,
      providerId: string,
      providerAccountId: string
    ) {
      console.log('unlinkAccount', { userId, providerId, providerAccountId });
      return null;
    }

    /* Only for username / password */

    async function getUserByCredentials(credentials: any) {
      console.log('getUserByCredentials', credentials);
      return null;
    }

    /* for when not using JWTs */

    async function createSession(user: User) {
      console.log('createSession', user);
      return null;
    }

    async function getSession() {
      return null;
    }

    async function updateSession(session: any, force: boolean) {
      console.log('updateSession', { session, force });
      return null;
    }

    async function deleteSession(sessionToken: string) {
      console.log('deleteSession', sessionToken);
      return null;
    }

    /* e-mail / passwordless verification request  */

    async function createVerificationRequest(
      identifier: string,
      url: string,
      token: string,
      secret: string,
      provider: EmailConfig
    ) {
      const hashedToken = hashToken(token);

      const newVerificationRequest = {
        id: hashToken(`${identifier}:${hashedToken}:${secret}`),
        identifier,
        token: hashedToken,
        expires:
          timestamp() +
          Number(process.env.DECI_VERIFICATION_EXPIRES_SECONDS || 86400),
      };

      await data.verificationrequests.put(newVerificationRequest);

      await provider.sendVerificationRequest({
        identifier,
        url,
        token,
        baseUrl: appOptions.baseUrl,
        provider,
      });
    }

    async function getVerificationRequest(
      identifier: string,
      token: string,
      secret: string
    ): Promise<VerificationRequestRecord | undefined> {
      const hashedToken = hashToken(token);
      const id = hashToken(`${identifier}:${hashedToken}:${secret}`);
      return data.verificationrequests.get({ id });
    }

    async function deleteVerificationRequest(
      identifier: string,
      token: string,
      secret: string
    ) {
      const hashedToken = hashToken(token);
      const id = hashToken(`${identifier}:${hashedToken}:${secret}`);
      await data.verificationrequests.delete({ id });
    }

    function hashToken(token: string): string {
      return createHash('sha256')
        .update(`${token}${secretOption}`)
        .digest('hex');
    }

    return {
      createUser,
      getUser,
      getUserByEmail,
      getUserByProviderAccountId,
      getUserByCredentials,
      updateUser,
      deleteUser,
      linkAccount,
      unlinkAccount,
      createSession,
      getSession,
      updateSession,
      deleteSession,
      createVerificationRequest,
      getVerificationRequest,
      deleteVerificationRequest,
    };
  }

  return {
    getAdapter,
  };
}
