import { HttpHandler } from '@architect/functions';
import {
  GithubUser,
  User,
  UserInput,
  UserWithSecret,
} from '@decipad/backendtypes';
import { auth as authConfig } from '@decipad/config';
import { jwt } from '@decipad/services/authentication';
import {
  create as createUser,
  maybeEnrich as maybeEnrichUser,
} from '@decipad/services/users';
import tables from '@decipad/tables';
import NextAuth, { TokenSet } from 'next-auth';
import adaptReqRes from './adapt-req-res';
import createDbAdapter from './db-adapter';
import { isAllowedToLogIn } from './is-allowed';
import { Email, Github } from './providers';

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

async function signInGithub(
  user: UserWithSecret & { provider?: string; providerId?: string },
  account: any,
  metadata: GithubUser
) {
  const githubUser = {
    id: metadata.id,
    login: metadata.login,
    name: metadata.name,
    image: metadata.avatar_url,
    email: metadata.email,
  };

  if (!(await isAllowedToLogIn(metadata.email))) {
    return false;
  }

  let existingUser;
  const data = await tables();
  const userKeyId = `github:${githubUser.id}`;
  const userKey = await data.userkeys.get({ id: userKeyId });

  if (userKey) {
    existingUser = await data.users.get({ id: userKey.user_id });
  }

  const userInput = {
    name: (githubUser.name || githubUser.login)!,
    image: githubUser.image,
    email: githubUser.email,
    provider: 'github',
    providerId: `${githubUser.id}`,
  };

  if (existingUser) {
    existingUser = await maybeEnrichUser(existingUser, userInput);
  } else {
    // If the user does not exist, we just create a new one.
    // In the future, we might want to redirect the user
    // to a registration page by defining next-auth options.pages.newUser.

    existingUser = (await createUser(userInput)).user;
  }

  // let's make next-auth happy:
  user.accessToken = existingUser.secret;
  user.provider = 'github';
  user.providerId = `${githubUser.id}`;

  account.id = githubUser.id;

  return true;
}

async function signInEmail(user: UserWithSecret, account: any, metadata: any) {
  if (!(await isAllowedToLogIn(metadata.email))) {
    return false;
  }

  let existingUser;
  const data = await tables();
  const userKeyId = `email:${metadata.email}`;
  const userKey = await data.userkeys.get({ id: userKeyId });

  if (userKey) {
    existingUser = await data.users.get({ id: userKey.user_id });
  }
  if (existingUser) {
    const userInput: Partial<UserInput> = {
      email: metadata.email as string,
    };
    if (!existingUser.name) {
      userInput.name = userInput.email;
    }
    existingUser = await maybeEnrichUser(existingUser, userInput);
  } else {
    // If the user does not exist, we just create a new one.
    // In the future, we might want to redirect the user
    // to a registration page by defining next-auth options.pages.newUser.

    existingUser = (
      await createUser({
        name: metadata.email,
        email: metadata.email as string,
        provider: account.provider,
      })
    ).user;
  }

  user.accessToken = existingUser.secret;

  return true;
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
