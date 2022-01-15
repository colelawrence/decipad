import assert from 'assert';
import NextAuthJWT from 'next-auth/jwt';
import { Cookie } from 'playwright';
import { User } from '@decipad/backendtypes';
import { authentication } from '@decipad/services';
import tables from '@decipad/tables';
import { now } from './now';

interface Credentials {
  cookies: Cookie[];
}

interface AuthenticateOptions {
  domain: string;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
}

export async function credentials(
  userInput: User,
  options: AuthenticateOptions
): Promise<Credentials> {
  const data = await tables();
  const user = await data.users.get({ id: userInput.id });
  assert(user, `No such user: ${userInput.id}`);
  assert(user.secret, 'User does not have secret');

  const jwtOptions = {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  };
  // generate token
  const token = await NextAuthJWT.encode({
    ...authentication.jwt,
    token: { accessToken: user.secret },
    ...jwtOptions,
  });

  return {
    cookies: [
      {
        name: 'next-auth.session-token',
        value: token,
        path: '/',
        expires: now() + jwtOptions.maxAge,
        httpOnly: true,
        ...options,
      },
    ],
  };
}
