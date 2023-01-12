import { identify, track } from '@decipad/backend-analytics';
import { UserWithSecret } from '@decipad/backendtypes';
import { app, auth as authConfig } from '@decipad/config';
import { jwt } from '@decipad/services/authentication';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { extend, pick } from 'lodash';
import NextAuth, { NextAuthOptions } from 'next-auth';
import adaptReqRes from './adapt-req-res';
import { adapter } from './db-adapter';
import { signInEmail } from './email';
import { Email } from './providers';

const {
  // providers: { github: githubConfig }, // uncommment this when enabling Github logins
  jwt: jwtConfig,
} = authConfig();

export function createAuthHandler(): APIGatewayProxyHandlerV2 {
  const providers = [
    // Github(githubConfig), // uncommment this when enabling Github logins
    Email(),
  ];

  const callbacks: NextAuthOptions['callbacks'] = {
    async signIn({ user, account }) {
      // uncommment this when enabling Github logins
      // if (account.provider === 'github' && metadata && metadata.id) {
      //   return signInGithub(user, account, metadata);
      // }
      if (account?.type === 'email') {
        if (!(await signInEmail(user as UserWithSecret, account))) {
          throw Boom.forbidden(
            'This email is not allowed to log in. We are in closed beta, so please sign up to the wait list.'
          );
        }
        return true;
      }
      return false;
    },

    async jwt({ user, token }) {
      if (user) {
        token.accessToken = (user as { secret?: string }).secret;
        if (!token.accessToken) {
          throw new Error('no secret for user');
        }
      }

      return token;
    },

    async session({ session, token }) {
      console.log('session', { session, token });
      if (token.accessToken) {
        const data = await tables();
        const users = (
          await data.users.query({
            IndexName: 'bySecret',
            KeyConditionExpression: 'secret = :secret',
            ExpressionAttributeValues: {
              ':secret': token.accessToken as string,
            },
          })
        ).Items;
        if (users.length !== 1) {
          return session;
        }
        const [user] = users;
        extend(
          session.user,
          pick(user, 'id', 'email', 'name', 'image', 'description')
        );

        const userKeys = (
          await data.userkeys.query({
            IndexName: 'byUserId',
            KeyConditionExpression: 'user_id = :user_id',
            ExpressionAttributeValues: {
              ':user_id': user.id,
            },
          })
        ).Items.filter((key) => key.id.startsWith('username:'));

        if (userKeys.length) {
          const [userKey] = userKeys;
          const username = userKey.id.split(':')[1];
          if (username) {
            extend(session.user, {
              username: `@${username}`,
            });
          }
        }
        console.log(userKeys);
      }
      return session;
    },
  };

  const events: NextAuthOptions['events'] = {
    signIn: async (message) => {
      await identify(message.user.id, {
        email: message.user.email,
        fullName: message.user.name,
      });
      await track({
        event: 'sign in',
        userId: message.user.id,
        properties: {
          isNewUser: message.isNewUser,
        },
      });
    },

    signOut: async (message) => {
      await track({
        event: 'sign out',
        properties: {
          email: message.session?.user?.email,
        },
      });
    },
  };

  const adapterOptions = {
    secret: jwtConfig.secret,
    baseUrl: app().urlBase,
  };

  const options: NextAuthOptions = {
    session: {
      strategy: 'jwt',
      maxAge: jwtConfig.maxAge,
    },
    providers,
    callbacks,
    events,
    jwt,
    adapter: adapter(adapterOptions),
    debug: !!process.env.DEBUG,
    pages: {
      verifyRequest: '/verifyEmail',
      signIn: '/',
      newUser: '/',
      error: '/error',
    },
    theme: {
      colorScheme: 'light',
      logo: '/docs/img/deci-logo-brand.png',
      brandColor: 'rgb(243, 254, 225)',
    },
  };

  return adaptReqRes(NextAuth(options));
}
