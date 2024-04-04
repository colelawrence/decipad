import type { UserInput, UserWithSecret } from '@decipad/backendtypes';
import tables, { timestamp } from '@decipad/tables';
import { forbidden, notAcceptable } from '@hapi/boom';
import { isAllowedToLogIn } from './isAllowed';
import { nanoid } from 'nanoid';

/**
 * Small helper to just create a backend user.
 * Without workspaces, or anything around it.
 */
export async function justCreateUser(user: UserInput): Promise<UserWithSecret> {
  const data = await tables();
  const email = user.email?.toLowerCase();

  if (!user.email) {
    throw notAcceptable('Need user email');
  }

  if (!isAllowedToLogIn(user.email)) {
    throw forbidden();
  }

  const newUser = {
    email,
    id: nanoid(),
    name: user.name,
    last_login: timestamp(),
    image: user.image,
    secret: nanoid(),
  };

  await data.users.create(newUser);

  return newUser;
}
