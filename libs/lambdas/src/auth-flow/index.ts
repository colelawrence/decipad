import { HttpHandler } from '@architect/functions';
import { UserWithSecret } from '@decipad/backendtypes';
import { auth as authConfig, app } from '@decipad/config';
import { jwt } from '@decipad/services/authentication';
import NextAuth, { NextAuthOptions } from 'next-auth';
import adaptReqRes from './adapt-req-res';
import { adapter } from './db-adapter';
import {
  Email,
  // Github // uncommment this when enabling Github logins
} from './providers';
import { signInEmail } from './email';
// import { signInGithub } from './github'; // uncommment this when enabling Github logins

const {
  // providers: { github: githubConfig }, // uncommment this when enabling Github logins
  jwt: jwtConfig,
} = authConfig();

export default function createAuthHandler(): HttpHandler {
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

    async jwt(params) {
      const { user, token } = params;
      if (user) {
        token.accessToken = user.secret;
        if (!token.accessToken) {
          throw new Error('no secret for user');
        }
      }

      return token;
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
