import { HttpHandler } from '@architect/functions';
import { User, UserWithSecret } from '@decipad/backendtypes';
import { auth as authConfig } from '@decipad/config';
import { jwt } from '@decipad/services/authentication';
import tables from '@decipad/tables';
import NextAuth, { TokenSet } from 'next-auth';
import adaptReqRes from './adapt-req-res';
import createDbAdapter from './db-adapter';
import { Email, Github } from './providers';
import { signInEmail } from './email';
import { signInGithub } from './github';

const {
  providers: { github: githubConfig },
  jwt: jwtConfig,
} = authConfig();

export default function createAuthHandler(): HttpHandler {
  const providers = [Github(githubConfig), Email()];

  const callbacks = {
    async signIn(
      user: UserWithSecret,
      account: any,
      metadata: any
    ): Promise<boolean> {
      if (account.provider === 'github' && metadata && metadata.id) {
        return signInGithub(user, account, metadata);
      }
      if (account.type === 'email') {
        return signInEmail(user, account, metadata);
      }
      return false;
    },

    async jwt(token: TokenSet, user: UserWithSecret): Promise<TokenSet> {
      if (user) {
        token.accessToken = user.secret;
      }

      return token;
    },

    async session(
      session: Record<string, any>,
      token: TokenSet
    ): Promise<Record<string, any> | null> {
      session.accessToken = token.accessToken;
      const user = await findUserByAccessToken(token.accessToken);

      if (user) {
        Object.assign(session.user, {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        });
        return session;
      }
      return null;
    },
  };

  const options = {
    session: {
      jwt: true,
      secret: jwtConfig.secret,
    },
    providers,
    callbacks,
    jwt,
    adapter: createDbAdapter(),
    debug: !!process.env.DEBUG,
    pages: {
      verifyRequest: '/verifyEmail',
    },
  };

  // @ts-expect-error Because next-auth types are apparently mistaken
  return adaptReqRes(NextAuth(options));
}

async function findUserByAccessToken(
  accessToken: string
): Promise<User | undefined> {
  const data = await tables();

  const foundUsers = await data.users.query({
    IndexName: 'bySecret',
    KeyConditionExpression: 'secret = :secret',
    ExpressionAttributeValues: {
      ':secret': accessToken,
    },
  });

  return foundUsers.Items[0];
}
