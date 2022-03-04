import { UserInput, UserWithSecret } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createUser,
  maybeEnrich as maybeEnrichUser,
} from '@decipad/services/users';
import { isAllowedToLogIn } from './is-allowed';

export async function signInEmail(
  user: UserWithSecret,
  account: any,
  metadata: any
) {
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
