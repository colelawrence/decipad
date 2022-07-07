import { HttpResponse } from '@architect/functions';
import { badRequest } from '@hapi/boom';
import { encode } from 'next-auth/jwt';
import tables from '@decipad/tables';
import {
  create as createUser,
  maybeEnrich as maybeEnrichUser,
} from '@decipad/services/users';
import { jwt as jwtConf } from '@decipad/services/authentication';
import { isAllowedToLogIn } from './is-allowed';
import { UserInput } from '../types';

const defaultTestUserEmail = 'test@decipad.com';
const isSecureCookie =
  process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('https:');
const tokenCookieName = isSecureCookie
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export const testUserAuth = async (url: URL): Promise<HttpResponse> => {
  const email = url.searchParams.get('email') || defaultTestUserEmail;
  if (!(await isAllowedToLogIn(email))) {
    throw badRequest();
  }
  console.log('TEST USER AUTH', email);

  let existingUser;
  const data = await tables();
  const userKeyId = `email:${email}`;
  const userKey = await data.userkeys.get({ id: userKeyId });

  if (userKey) {
    existingUser = await data.users.get({ id: userKey.user_id });
  }
  if (existingUser) {
    const userInput: Partial<UserInput> = {
      email,
    };
    if (!existingUser.name) {
      userInput.name = 'Test User';
    }
    existingUser = await maybeEnrichUser(existingUser, userInput);
  } else {
    // If the user does not exist, we just create a new one.
    // In the future, we might want to redirect the user
    // to a registration page by defining next-auth options.pages.newUser.

    existingUser = (
      await createUser({
        name: 'Test User',
        email,
        provider: 'email',
      })
    ).user;
  }

  const token = await encode({
    ...jwtConf,
    token: {
      accessToken: existingUser.secret,
    },
    maxAge: 5 * 60,
  });

  let cookie = `${tokenCookieName}=${token}`;
  cookie += `; HttpOnly; Path=/; Max-Age=${jwtConf.maxAge}; SameSite=Strict`;
  if (isSecureCookie) {
    cookie += '; Secure';
  }

  return {
    statusCode: 302,
    headers: {
      Location: '/',
      'Set-Cookie': cookie,
    },
  };
};
