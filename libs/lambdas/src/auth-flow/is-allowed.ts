import tables from '@decipad/tables';

const ALLOWLIST_REQUIRED_URL_BASES = [
  'https://alpha.dev.decipad.com',
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
  if (process.env.NODE_ENV === 'testing') {
    return true;
  }
  const urlBase = process.env.DECI_APP_URL_BASE;
  if (!urlBase || ALLOWLIST_REQUIRED_URL_BASES.indexOf(urlBase) < 0) {
    return true;
  }
  if (!email) {
    return false;
  }

  return (await alreadyIn(email)) || isInAllowList(email);
}
