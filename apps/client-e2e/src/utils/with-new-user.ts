import { BrowserContext } from 'playwright';
import { URL } from 'url';
import { credentials, newRandomUser } from '.';
import { baseUrl } from '../../testConfig';

export async function withNewUser(ctx?: BrowserContext) {
  const userCreationResult = await newRandomUser();
  const { cookies } = await credentials(userCreationResult.user, {
    domain: new URL(baseUrl).host,
    secure: true,
    sameSite: 'Lax',
  });
  const Context = ctx || context;
  Context.clearCookies();
  await Context.addCookies(cookies);

  return userCreationResult;
}
