/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import { Account, NextAuthOptions, User } from 'next-auth';
import { UserInput } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createUser,
  isAllowedToLogIn,
} from '@decipad/services/users';
import { createVerifier } from '@decipad/services/authentication';
import pick from 'lodash.pick';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

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

export const adapter = (
  event: APIGatewayProxyEventV2,
  adapterOpts: AdapterOptions
): Adapter => {
  const verifier = createVerifier({ ...adapterOpts, event });

  return {
    async createUser(profile: Omit<User, 'id'>): Promise<AdapterUser> {
      const name = profile.name || 'unknown';
      return (await createUser({ ...profile, name } as UserInput, event))
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
          await createUser(
            {
              name: email,
              email,
              provider: 'email',
              providerId: email,
            },
            event
          )
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
        const userKeys = (
          await data.userkeys.query({
            IndexName: 'byUserId',
            KeyConditionExpression: 'user_id = :user_id',
            ExpressionAttributeValues: {
              ':user_id': user.id,
            },
          })
        ).Items.filter((key) => key.id.startsWith('email:'));

        const [userkey] = userKeys;

        if (userkey) {
          userkey.validated_at = verifiedAt.getTime();

          await data.userkeys.put(userkey);
        }
      }

      const previousUser = await data.users.get({ id: user.id });
      const name = user.name || previousUser?.name || 'unknown';
      const newUser = {
        ...previousUser,
        ...pick(user, 'email', 'image', 'id'),
        name,
      };
      await data.users.put(newUser);
      return newUser;
    },

    async deleteUser() {
      return null;
    },

    async linkAccount(account: Account) {
      // already linked, you don't have to do a thing
      console.log('auth: linkAccount', account);
    },

    async unlinkAccount(account: Account) {
      console.log('auth: unlinkAccount', account);
    },

    /* Only for username / password */

    async getUserByCredentials(credentials: Record<string, unknown>) {
      console.log('auth: getUserByCredentials', credentials);
      return null;
    },

    /* for when not using JWTs */

    async createSession(session: Record<string, unknown>) {
      console.log('auth: createSession', session);
      return session;
    },

    async getSession() {
      console.log('auth: getSession');
      return null;
    },

    async getSessionAndUser(sessionToken: string) {
      console.log('auth: getSessionAndUser', sessionToken);
      return null;
    },

    async updateSession(session: Record<string, unknown>) {
      console.log('auth: updateSession', { session });
      return null;
    },

    async deleteSession(sessionToken: string) {
      console.log('auth: deleteSession', sessionToken);
      return null;
    },

    /* e-mail / passwordless verification request  */
    createVerificationToken: verifier.createVerificationToken,
    useVerificationToken: verifier.useVerificationToken,
  } as unknown as Adapter;
};
