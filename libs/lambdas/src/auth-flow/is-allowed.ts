import tables from '@decipad/services/tables';

export async function isAllowedToLogIn(email?: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'testing') {
    return true;
  }
  if (!email) {
    return false;
  }
  const data = await tables();
  return (
    (await data.allowlist.get({ email: email.toLocaleLowerCase() })) != null
  );
}
