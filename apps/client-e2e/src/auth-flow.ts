import { Page } from 'playwright-core';
import waitForExpect from 'wait-for-expect';
import { setUp } from './page-utils/Home';
import { snapshot } from './utils';
import { withTestUser } from './utils/with-test-user';

describe('auth flow', () => {
  beforeAll(async () => {
    await setUp();
    page.waitForTimeout(5000);
  });

  test('Should display welcome message', async () => {
    await page.goto('/');
    await waitForExpect(async () =>
      expect(await page.isVisible('text=/make/i')).toBe(true)
    );
    await snapshot(page as Page, 'Auth: Login Window');
  });

  test('should allow the user to type their email for login', async () => {
    await page.type('input', 'johndoe123@gmail.com');
    const inputValue = await page.inputValue('input');
    expect(inputValue).toBe('johndoe123@gmail.com');
  });

  test('should show confirmation email on login attempt', async () => {
    await page.fill('[placeholder~="email" i]', 'johndoe123@gmail.com');
    await page.click('text=/continue/i');
    expect(await page.waitForSelector('text=/check.+email/i')).not.toBe(null);
    await snapshot(page as Page, 'Auth: Magic Link Email Sent');
  });

  test('should redirect to workspace if authenticated', async () => {
    await setUp();
    await withTestUser();
    await page.goto('/');
    await waitForExpect(async () =>
      expect(await page.isVisible('text=/Workspace/i')).toBe(true)
    );
  });
});
