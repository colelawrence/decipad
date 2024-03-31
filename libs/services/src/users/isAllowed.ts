import { app } from '@decipad/backend-config';
import { once } from '@decipad/utils';
import { forbidden, notAcceptable } from '@hapi/boom';

const protectedUrlBases = once(
  () => new Set(['https://dev.decipad.com', 'https://decipadstaging.com'])
);

const allowedDomains = once(
  () => new Set(['decipad.com', 'n1n.co', 'inbox.testmail.app'])
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function isAllowedToLogIn(email?: string): Promise<boolean> {
  if (!email) {
    throw forbidden('need an email address');
  }
  const currentBase = app().urlBase;
  if (protectedUrlBases().has(currentBase)) {
    // we now protect the main dev environment
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      throw notAcceptable(`Illegal email address: ${email}`);
    }
    const [, domain] = emailParts;
    if (!allowedDomains().has(domain)) {
      throw forbidden('Cannot log in here with that email address');
    }
  }

  return true;
}
