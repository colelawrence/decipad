import percySnapshot from '@percy/playwright';
import waitForExpect from 'wait-for-expect';
import { setUp } from './page-utils/Home';
import { withNewUser } from './utils/with-new-user';

beforeAll(async () => {
  await setUp();
});

test('Should display welcome message', async () => {
  await percySnapshot(page, 'Auth: Login Window');
  await waitForExpect(async () =>
    expect(await page.isVisible('text=/make/i')).toBe(true)
  );
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
  await percySnapshot(page, 'Auth: Magic Link Email Sent');
});

test('should redirect to workspace if authenticated', async () => {
  await withNewUser();
  await page.goto('/');
  await waitForExpect(async () =>
    expect(await page.isVisible('text=/Workspace/i')).toBe(true)
  );
});
