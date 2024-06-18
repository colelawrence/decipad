/* eslint-disable no-param-reassign */
import { createHmac } from 'crypto';
import { identify, track } from '@decipad/backend-analytics';
import type { UserWithSecret } from '@decipad/backendtypes';
import { app, auth as authConfig, thirdParty } from '@decipad/backend-config';
import { jwt } from '@decipad/services/authentication';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import type {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
} from 'aws-lambda';
import pick from 'lodash/pick';
import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import adaptReqRes from './adapt-req-res';
import { adapter } from './db-adapter';
import { signInEmail } from './email';
import { Email } from './providers';
import md5 from 'md5';

const {
  // providers: { github: githubConfig }, // uncommment this when enabling Github logins
  jwt: jwtConfig,
} = authConfig();

export function createAuthHandler(): APIGatewayProxyHandlerV2 {
  const providers = (event: APIGatewayProxyEventV2) => [Email(event)];

  const callbacks = (
    event: APIGatewayProxyEventV2
  ): NextAuthOptions['callbacks'] => ({
    async signIn({ user, account }) {
      if (account?.type === 'email') {
        if (!(await signInEmail(event, user as UserWithSecret, account))) {
          throw Boom.forbidden(
            `It looks like your email isn't allowed yet. We are in closed beta, so hopefully your turn is coming up soon.`
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

        if (session.user) {
          Object.assign(
            session.user,
            {
              image: user.email
                ? md5(user.email, { encoding: 'binary' })
                : undefined,
            },
            pick(user, 'id', 'email', 'name', 'onboarded', 'description')
          );

          const intercomSecret = thirdParty().intercom.secretId;

          if (intercomSecret) {
            const hmac = createHmac('sha256', intercomSecret);
            hmac.update(user.id);
            Object.assign(session.user, {
              intercomUserHash: hmac.digest('hex'),
            });
          }
        }

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
          // the user_id in data.userkeys is not unique
          const userKey = userKeys.sort(
            (uk1, uk2) => (uk2.createdAt || 0) - (uk1.createdAt || 0)
          )[0];
          const username = userKey.id.split(':')[1];
          if (username && session.user) {
            Object.assign(session.user, {
              username: `@${username}`,
            });
          }
        }
      }

      return session;
    },
  });

  const events = (
    event: APIGatewayProxyEventV2
  ): NextAuthOptions['events'] => ({
    signIn: async (message) => {
      await identify(event, message.user.id, {
        email: message.user.email,
        fullName: message.user.name,
      });
      // eslint-disable-next-line no-console
      console.log('Sign in', { message, event });
      const data = await tables();
      const user = await data.users.get({ id: message.user.id });
      if (message.isNewUser || user?.previous_login == null) {
        // first time logging in
        await track(event, {
          event: 'Signed Up',
          userId: message.user.id,
          properties: {
            user_email: message.user.email,
            signup_source:
              event.queryStringParameters?.source ?? 'Sign up form',
            analytics_source: 'backend',
          },
        });
      }
      await track(event, {
        event: 'Signed In',
        userId: message.user.id,
        properties: {
          new_account: message.isNewUser,
          analytics_source: 'backend',
        },
      });
    },

    signOut: async (message) => {
      await track(event, {
        event: 'Signed Out',
        properties: {
          email: message.session?.user?.email,
          analytics_source: 'backend',
        },
      });
    },
  });

  const adapterOptions = {
    secret: jwtConfig.secret,
    baseUrl: app().urlBase,
  };

  const options = (event: APIGatewayProxyEventV2): NextAuthOptions => ({
    session: {
      strategy: 'jwt',
      maxAge: jwtConfig.maxAge,
    },
    providers: providers(event),
    callbacks: callbacks(event),
    events: events(event),
    jwt,
    adapter: adapter(event, adapterOptions),
    debug: true,
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
  });

  return (event) => adaptReqRes(NextAuth(options(event)))(event);
}
