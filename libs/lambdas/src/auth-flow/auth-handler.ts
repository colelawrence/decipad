import { HttpHandler } from '@architect/functions';
import { UserWithSecret } from '@decipad/backendtypes';
import { app, auth as authConfig } from '@decipad/config';
import { jwt } from '@decipad/services/authentication';
import { identify, track } from '@decipad/backend-analytics';
import NextAuth, { NextAuthOptions } from 'next-auth';
import tables from '@decipad/tables';
import adaptReqRes from './adapt-req-res';
import { adapter } from './db-adapter';
import {
  Email,
  // Github // uncommment this when enabling Github logins
} from './providers';
import { signInEmail } from './email';

const {
  // providers: { github: githubConfig }, // uncommment this when enabling Github logins
  jwt: jwtConfig,
} = authConfig();

export function createAuthHandler(): HttpHandler {
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
      if (account.type === 'email') {
        return signInEmail(user as UserWithSecret, account);
      }
      return false;
    },

    async jwt({ user, token }) {
      if (user) {
        token.accessToken = user.secret;
        if (!token.accessToken) {
          throw new Error('no secret for user');
        }
      }

      return token;
    },

    async session({ session, user, token }) {
      if (!user && token.email && session.user) {
        const data = await tables();
        const userKey = await data.userkeys.get({ id: `email:${token.email}` });
        if (userKey) {
          (session.user as { id?: string }).id = userKey.user_id;
        }
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

  // @ts-expect-error Because next-auth types are apparently mistaken
  return adaptReqRes(NextAuth(options));
}
