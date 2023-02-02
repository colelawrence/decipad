import { app, auth } from '@decipad/config';
import { BrowserContext, Page } from 'playwright';
import { randomEmail } from '.';

interface WithTestUserProps {
  context: BrowserContext;
  page: Page;
  email?: string;
}

export interface TestUser {
  email: string;
}

export async function withTestUser({
  context,
  page,
  email = randomEmail(),
}: WithTestUserProps): Promise<TestUser> {
  const Context = context;
  Context.clearCookies();
  const loginUrl = `${app().urlBase}/api/auth/${
    auth().testUserSecret
  }?email=${encodeURIComponent(email)}`;
  await page.goto(loginUrl);
  await page.waitForURL(/\/w\//);

  return { email };
}
