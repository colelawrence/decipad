import { newRandomUser, credentials } from './';
import { baseUrl } from '../../testConfig';
import { URL } from 'url';

export async function withNewUser() {
  const user = await newRandomUser();
  const { cookies } = await credentials(user, {
    domain: new URL(baseUrl).host,
    secure: true,
    sameSite: 'Lax',
  });
  context.clearCookies();
  await context.addCookies(cookies);

  return user;
}
