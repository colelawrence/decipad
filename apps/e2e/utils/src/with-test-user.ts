import { app, auth } from '@decipad/backend-config';
import type { BrowserContext, Page } from '@playwright/test';
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
  await context.clearCookies();
  const loginUrl = `${app().urlBase}/api/auth/${
    auth().testUserSecret
  }?email=${encodeURIComponent(email)}`;
  await page.goto(loginUrl);
  await page.waitForURL(/\/w\//);

  return { email };
}
