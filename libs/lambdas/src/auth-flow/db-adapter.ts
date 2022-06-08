import { createHash } from 'crypto';
import { Account, NextAuthOptions, User } from 'next-auth';
import { UserInput } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import { create as createUser } from '@decipad/services/users';
import { isAllowedToLogIn } from './is-allowed';

// Next-Auth does not expose some types
// So we have to help here.
interface AdapterOptions {
  secret: string;
  baseUrl: string;
}

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

type Adapter = NonNullable<NextAuthOptions['adapter']>;
type AdapterUser = User & { id: string; emailVerified: boolean };

interface VerificationRequest {
  identifier: string;
  token: string;
}

export const adapter = ({ secret }: AdapterOptions): Adapter => {
  function hashToken(token: string): string {
    return createHash('sha256').update(`${token}${secret}`).digest('hex');
  }

  return {
    async createUser(profile: Omit<User, 'id'>): Promise<AdapterUser> {
      const name = profile.name || 'unknown';
      return (await createUser({ ...profile, name } as UserInput))
        .user as unknown as AdapterUser;
    },

    async getUser(id: string): Promise<User | undefined> {
      const data = await tables();
      return (await data.users.get({ id })) as User | undefined;
    },

    async getUserByEmail(email: string): Promise<User | null> {
      const data = await tables();
      const keyId = `email:${email}`;
      const key = await data.userkeys.get({ id: keyId });
      let user: User | null = null;
      if (key) {
        user = (await data.users.get({ id: key.user_id })) as User;
      }
      if (!user && (await isAllowedToLogIn(email))) {
        user = (
          await createUser({
            name: email,
            email,
            provider: 'email',
            providerId: email,
          })
        ).user;
      }

      return user;
    },

    async getUserByAccount(
      providerId: string,
      providerAccountId: string
    ): Promise<User | undefined> {
      const data = await tables();
      const userkey = await data.userkeys.get({
        id: `${providerId}:${providerAccountId}`,
      });
      let user;
      if (userkey) {
        user = await data.users.get({ id: userkey.user_id });
      }

      return user as undefined | User;
    },

    async updateUser(user: User & { emailVerified?: Date }) {
      const data = await tables();
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

      const previousUser = await data.users.get({ id: user.id });
      const name = user.name || previousUser?.name || 'unknown';
      const newUser = { ...previousUser, ...user, name };
      await data.users.put(newUser);
      return newUser;
    },

    async deleteUser() {
      return null;
    },

    async linkAccount(account: Account) {
      // already linked, you don't have to do a thing
      console.log('linkAccount', account);
    },

    async unlinkAccount(account: Account) {
      console.log('unlinkAccount', account);
    },

    /* Only for username / password */

    async getUserByCredentials(credentials: any) {
      console.log('getUserByCredentials', credentials);
      return null;
    },

    /* for when not using JWTs */

    async createSession(session: any) {
      console.log('createSession', session);
      return session;
    },

    async getSession() {
      return null;
    },

    async getSessionAndUser(sessionToken: string) {
      console.log('getSessionAndUser', sessionToken);
      return null;
    },

    async updateSession(session: any) {
      console.log('updateSession', { session });
      return null;
    },

    async deleteSession(sessionToken: string) {
      console.log('deleteSession', sessionToken);
      return null;
    },

    /* e-mail / passwordless verification request  */

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

    async useVerificationToken(verification: VerificationRequest) {
      const { identifier, token } = verification;
      const data = await tables();
      const hashedToken = hashToken(token);
      const id = hashToken(`${identifier}:${hashedToken}`);
      const verificationRequest = await data.verificationrequests.get({ id });
      if (verificationRequest) {
        await data.verificationrequests.delete({ id });
        const expirationDate = new Date(verificationRequest.expires * 1000);
        return {
          ...verificationRequest,
          expires: expirationDate,
        };
      }
      return null;
    },

    async deleteVerificationRequest(
      identifier: string,
      token: string,
      secret2: string
    ) {
      const data = await tables();
      const hashedToken = hashToken(token);
      const id = hashToken(`${identifier}:${hashedToken}:${secret2}`);
      await data.verificationrequests.delete({ id });
    },
  } as unknown as Adapter;
};
