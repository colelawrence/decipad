import { BrowserContext, Page, expect, test } from '@playwright/test';
import arc from '@architect/functions';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createCalculationBlockBelow } from '../utils/page/Block';

// this test looks broken
test.describe.fixme('Sharing pad with email', () => {
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
      .first()
      .click();

    await page.getByTestId('notebook-title').fill('');

    await focusOnBody(page);

    // Is hidden by default
    await expect(page.locator('.notebook-collaborate-tab')).toHaveCount(0);

    // Is shown when clicking on the plus avatar
    await page.getByRole('button').getByText('Share').click();
    await expect(page.locator('.notebook-collaborate-tab')).toHaveCount(1);
    await expect(page.locator('.notebook-collaborate-tab')).toBeVisible();

    await page
      .locator('.notebook-collaborate-tab input')
      .fill('invited-lama@ranch.org');
    await page.getByTestId('send-invitation').click();

    // Close the share popup;
    await page.getByRole('button').getByText('Share').click();

    await page.getByRole('button').getByText('Share').click();
    await page
      .locator('.notebook-collaborate-tab input')
      .fill('invited-lama2@ranch.org');
    await page.getByTestId('collaboration-level-dropdown').nth(0).click();
    await page.locator('text="Notebook reader"').click();
    await page.getByTestId('send-invitation').click();

    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('invited-lama2@ranch.org')).toBeVisible();

    const collaborators = await page
      .getByTestId(/^sharing-list:/)
      .getByText('collaborator')
      .count();
    expect(collaborators).toBe(1);
    const readers = await page
      .getByTestId(/^sharing-list:/)
      .getByText('reader')
      .count();
    expect(readers).toBe(1);
    const authors = await page.getByTestId('text-icon-button:author').count();
    expect(authors).toBe(1);
  });

  test('an registered user can collaborate after registration', async () => {
    publishedNotebookPage = (await incognito.newPage()) as Page;

    const data = await arc.tables();

    let authLink: string | undefined;
    await expect(async () => {
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
      authLink = `${origin}/api/auth/callback/email?callbackUrl=%2Fn%2Fwelcome&token=${encodeURIComponent(
        verificationRequest.openTokenForTestsOnly ?? ''
      )}&email=${encodeURIComponent(verificationRequest.identifier)}`;
    }).toPass();

    expect(authLink).toBeDefined();
    publishedNotebookPage.goto(authLink!);

    publishedNotebookPage
      .getByTestId('notebook-title')
      .waitFor({ timeout: 60000 });

    await createCalculationBlockBelow(publishedNotebookPage, 'Test = 68');
    await expect(
      publishedNotebookPage.getByTestId('codeline-varname')
    ).toHaveCount(5);

    publishedNotebookPage.close();
  });

  test('A reader cannot duplicate notebook', async () => {
    publishedNotebookPage = (await incognito.newPage()) as Page;

    const data = await arc.tables();

    let authLink: string | undefined;
    await expect(async () => {
      const verificationRequests = (
        await data.verificationrequests.query({
          IndexName: 'byIdentifier',
          KeyConditionExpression: 'identifier = :email',
          ExpressionAttributeValues: {
            ':email': 'invited-lama2@ranch.org',
          },
        })
      ).Items;

      expect(verificationRequests).toHaveLength(1);
      const [verificationRequest] = verificationRequests;
      expect(verificationRequest).toBeDefined();
      const { origin } = new URL(page.url());
      authLink = `${origin}/api/auth/callback/email?callbackUrl=%2Fn%2Fwelcome&token=${encodeURIComponent(
        verificationRequest.openTokenForTestsOnly ?? ''
      )}&email=${encodeURIComponent(verificationRequest.identifier)}`;
    }).toPass();

    expect(authLink).toBeDefined();
    publishedNotebookPage.goto(authLink!);

    const duplicateButton = page.locator('text="Duplicate"');

    // Reader collaborators should not be able to see duplicate button.
    await expect(duplicateButton).toBeHidden();
  });
});
