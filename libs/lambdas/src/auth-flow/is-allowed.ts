import tables from '@decipad/services/tables';

export async function isAllowedToLogIn(_email?: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'testing') {
    return true;
  }
  if (!_email) {
    return false;
  }
  const urlBase = process.env.DECI_APP_URL_BASE;
  if (
    !urlBase ||
    (urlBase !== 'https://alpha.dev.decipad.com' &&
      urlBase !== 'https://dev.decipad.com')
  ) {
    return true;
  }
  const data = await tables();
  const email = _email.toLowerCase();
  const emailKey = await data.userkeys.get({ id: `email:${email}` });
  if (emailKey != null) {
    return true;
  }
  return (await data.allowlist.get({ id: email })) != null;
}
