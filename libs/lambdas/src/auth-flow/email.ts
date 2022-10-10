import { Account } from 'next-auth';
import { UserInput, UserWithSecret } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createUser,
  maybeEnrich as maybeEnrichUser,
} from '@decipad/services/users';
import { isAllowedToLogIn } from './is-allowed';
import timestamp from '../common/timestamp';

export async function signInEmail(
  user: UserWithSecret & { provider?: string; providerId?: string },
  account: Account
) {
  const { email } = user;
  if (!email || !(await isAllowedToLogIn(email))) {
    return false;
  }

  let existingUser;
  const data = await tables();
  const userKeyId = `email:${email}`;
  const userKey = await data.userkeys.get({ id: userKeyId });

  if (userKey) {
    existingUser = await data.users.get({ id: userKey.user_id });
  }
  if (existingUser) {
    const userInput: Partial<UserInput> = {
      email: account.userId,
    };
    if (!existingUser.name) {
      userInput.name = userInput.email as string | undefined;
    }
    userInput.last_login = timestamp();
    existingUser = await maybeEnrichUser(existingUser, userInput);
  } else {
    // If the user does not exist, we just create a new one.
    // In the future, we might want to redirect the user
    // to a registration page by defining next-auth options.pages.newUser.

    existingUser = (
      await createUser({
        name: account.userId ?? '',
        email: account.userId,
        provider: account.provider,
      })
    ).user;
  }

  user.accessToken = existingUser.secret;

  return true;
}
