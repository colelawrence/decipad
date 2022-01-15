import { URL } from 'url';
import { newRandomUser, credentials } from '.';
import { baseUrl } from '../../testConfig';

export async function withNewUser() {
  const userCreationResult = await newRandomUser();
  const { cookies } = await credentials(userCreationResult.user, {
    domain: new URL(baseUrl).host,
    secure: true,
    sameSite: 'Lax',
  });
  context.clearCookies();
  await context.addCookies(cookies);

  return userCreationResult;
}
