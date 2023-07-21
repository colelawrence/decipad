import { BrowserContext, Page, expect, test } from '@playwright/test';
import arc from '@architect/functions';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createCalculationBlockBelow } from '../utils/page/Block';

test.describe('Sharing pad with email', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let incognito: BrowserContext;
  let publishedNotebookPage: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    incognito = await browser.newContext();
    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: false,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('invites an unregistered user to a notebook', async () => {
    await page
      .getByTestId('notebook-list-item')
      .getByText('Welcome to Decipad')
      .click();

    await page.getByTestId('notebook-title').fill('');

    await focusOnBody(page);

    // Is hidden by default
    await expect(page.locator('.notebook-invitation-popup')).toHaveCount(0);

    // Is shown when clicking on the plus avatar
    await page.getByRole('button').getByText('Share').click();
    await expect(page.locator('.notebook-invitation-popup')).toHaveCount(1);
    await expect(page.locator('.notebook-invitation-popup')).toBeVisible();

    await page
      .locator('.notebook-invitation-popup input')
      .fill('invited-lama@ranch.org');
    await page.getByTestId('send-invitation').click();

    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');

    const avatarsCountAfterInvitation = await page
      .getByTestId('avatar-img')
      .count();

    const expected =
      // eslint-disable-next-line playwright/no-conditional-in-test
      avatarsCountAfterInvitation === 4 || avatarsCountAfterInvitation === 2;

    expect(expected).toBe(true);
  });

  test('an registered user can collaborate after registration', async () => {
    publishedNotebookPage = (await incognito.newPage()) as Page;

    const data = await arc.tables();
    const verificationRequests = (
      await data.verificationrequests.query({
        IndexName: 'byIdentifier',
        KeyConditionExpression: 'identifier = :email',
        ExpressionAttributeValues: {
          ':email': 'invited-lama@ranch.org',
        },
      })
    ).Items;

    expect(verificationRequests).toHaveLength(1);
    const [verificationRequest] = verificationRequests;
    expect(verificationRequest).toBeDefined();
    const { origin } = new URL(page.url());
    const authLink = `${origin}/api/auth/callback/email?callbackUrl=%2Fn%2Fwelcome&token=${encodeURIComponent(
      verificationRequest.openTokenForTestsOnly ?? ''
    )}&email=${encodeURIComponent(verificationRequest.identifier)}`;

    publishedNotebookPage.goto(authLink);

    publishedNotebookPage.getByTestId('notebook-title').waitFor();

    await createCalculationBlockBelow(publishedNotebookPage, 'Test = 68');
    const count = await publishedNotebookPage.getByTestId('code-line').count();
    // eslint-disable-next-line playwright/no-conditional-in-test
    const acceptableCount = count === 4 || count === 2;
    expect(acceptableCount).toBe(true);
  });
});
