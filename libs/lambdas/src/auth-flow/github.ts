import { GithubUser, UserWithSecret } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createUser,
  maybeEnrich as maybeEnrichUser,
} from '@decipad/services/users';
import { isAllowedToLogIn } from './is-allowed';

export async function signInGithub(
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
