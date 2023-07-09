import { BrowserContext, Page, expect, test } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';

test.describe('Sharing pad with email', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('opens the invitation popup', async () => {
    await focusOnBody(page);

    // Is hidden by default
    await expect(page.locator('.notebook-invitation-popup')).toHaveCount(0);

    // Is shown when clicking on the plus avatar
    await page.getByRole('button').getByText('Share').click();
    await expect(page.locator('.notebook-invitation-popup')).toHaveCount(1);
    await expect(page.locator('.notebook-invitation-popup')).toBeVisible();
  });

  test('invites an unregistered user', async () => {
    await page
      .locator('.notebook-invitation-popup input')
      .fill('invited-lama@ranch.org');
    await page.getByTestId('send-invitation').click();

    const avatarsCountAfterInvitation = await page
      .getByTestId('avatar-img')
      .count();

    expect(avatarsCountAfterInvitation).toBe(2);

    // TODO: do we need to show avatars for unregistered users?
    // TODO: how do we communicate that user is added? (toast?)
  });

  test('an registered user can collaborate after registration', async () => {
    // TODO: we need an invitation link, can we get it from the backend/queue?
  });
});
