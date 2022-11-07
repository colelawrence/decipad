import tables from '@decipad/tables';
import { app } from '@decipad/config';

const ALLOWLIST_REQUIRED_URL_BASES = [
  'https://app.decipad.com',
  'https://dev.decipad.com',
];

async function alreadyIn(email: string): Promise<boolean> {
  const data = await tables();
  const emailKey = await data.userkeys.get({
    id: `email:${email.trim().toLowerCase()}`,
  });
  return emailKey != null;
}
async function isInAllowList(email: string): Promise<boolean> {
  const data = await tables();
  return (await data.allowlist.get({ id: email.trim().toLowerCase() })) != null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function isAllowedToLogIn(email?: string): Promise<boolean> {
  // @ts-expect-error Architect uses env name testing instead of the conventional test
  if (process.env.NODE_ENV === 'testing') {
    return true;
  }
  const { urlBase } = app();
  if (!urlBase || ALLOWLIST_REQUIRED_URL_BASES.indexOf(urlBase) < 0) {
    return true;
  }
  if (!email) {
    return false;
  }

  return (await alreadyIn(email)) || isInAllowList(email);
}
