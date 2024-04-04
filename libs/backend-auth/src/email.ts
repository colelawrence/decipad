import type { Account } from 'next-auth';
import type { UserInput, UserWithSecret } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import {
  create as createUser,
  maybeEnrich as maybeEnrichUser,
  isAllowedToLogIn,
} from '@decipad/services/users';
import { track } from '@decipad/backend-analytics';
import { timestamp } from '@decipad/backend-utils';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export async function signInEmail(
  event: APIGatewayProxyEventV2,
  user: UserWithSecret & { provider?: string; providerId?: string },
  account: Account
) {
  const { email } = user;
  if (!email || !(await isAllowedToLogIn(email))) {
    await track(event, {
      event: 'user denied logging in',
      properties: { email },
    });
    // eslint-disable-next-line no-console
    console.log(`user ${email} not allowed to log in`);
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
    if (existingUser.banned) {
      await track(event, {
        event: 'banned user tried logging in',
        properties: { email },
      });
      return false;
    }
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
      await createUser(
        {
          name: account.userId ?? '',
          email: account.userId,
          provider: account.provider,
        },
        event
      )
    ).user;
  }

  // eslint-disable-next-line no-param-reassign
  user.accessToken = existingUser.secret;

  return true;
}
