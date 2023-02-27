import { expect, Page, test, BrowserContext } from '@playwright/test';
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
    await page.getByTestId('avatar-invite').click();
    await expect(page.locator('.notebook-invitation-popup')).toHaveCount(1);
    await expect(page.locator('.notebook-invitation-popup')).toBeVisible();
  });

  test('invites an unregistered user', async () => {
    const avatarsCountBeforeInvitation = await page
      .locator('.notebook-avatars > div')
      .count();

    await page
      .locator('.notebook-invitation-popup input')
      .fill('invited-lama@ranch.org');
    await page.getByTestId('send-invitation').click();

    const avatarsCountAfterInvitation = await page
      .locator('.notebook-avatars > div')
      .count();

    // TODO: do we need to show avatars for unregistered users?
    // TODO: how do we communicate that user is added? (toast?)
    // expect(avatarsCountAfterInvitation).toBe(avatarsCountBeforeInvitation + 1);
    expect(avatarsCountAfterInvitation).toBe(avatarsCountBeforeInvitation);
  });

  test('an registered user can collaborate after registration', async () => {
    // TODO: we need an invitation link, can we get it from the backend/queue?
  });
});
