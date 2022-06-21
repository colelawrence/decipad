import { BrowserContext, Page } from 'playwright';
import { app, auth } from '@decipad/config';
import { randomEmail } from '.';

interface WithTestUserProps {
  ctx?: BrowserContext;
  p?: Page;
  email?: string;
}

export interface TestUser {
  email: string;
}

export async function withTestUser({
  ctx = context,
  p = page,
  email = randomEmail(),
}: WithTestUserProps = {}): Promise<TestUser> {
  const Context = ctx || context;
  Context.clearCookies();
  const loginUrl = `${app().urlBase}/api/auth/${
    auth().testUserSecret
  }?email=${encodeURIComponent(email)}`;
  await p.goto(loginUrl);

  return { email };
}
