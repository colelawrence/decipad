import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';

test.describe('Make sure collaboration works ', () => {
  let page1: Page;
  let context1: BrowserContext;
  let context2: BrowserContext;
  test.beforeEach(async ({ browser }) => {
    test.setTimeout(120_000);
    [context1, context2] = await Promise.all([
      browser.newContext(),
      browser.newContext(),
    ]);

    page1 = await context1.newPage();

    await setUp(
      { page: page1, context: context1 },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterEach(async () => {
    page1.close();
  });

  test('Check user cannot access notebook they do not have permission to', async () => {
    const page2 = await context2.newPage();
    await page2.goto(page1.url());

    const element = page2.getByText(
      "You don't have permissions to access this page"
    );
    page2.close();
    expect(!!element).toBeTruthy();
  });

  test('Invite another user to notepad with readonly', async () => {
    const page2 = await context2.newPage();
    const testUser2 = await setUp({ page: page2, context: context2 });
    await page1.getByTestId('publish-button').click();
    await page1.getByPlaceholder('Enter email address').fill(testUser2.email);
    await page1.keyboard.press('Tab');
    await page1.keyboard.press('Enter');
    await page1
      .getByText('Notebook readerCan read and interact only with this notebook')
      .click();
    await page1.getByTestId('send-invitation').click();

    // check test user two has read permissions only
    await page2.goto(page1.url());
    const readOnlyElement = page2.getByText('You are in reading mode');
    const titleElementPage1 = page1.getByTestId('editor-title');
    const titleElementPage2 = page2.getByTestId('editor-title');
    const page1Text = await titleElementPage1.textContent();
    const page2Text = await titleElementPage2.textContent();
    const title2IsEditable = await titleElementPage2.evaluate(
      (e: HTMLElement) => e.isContentEditable
    );
    page2.close();

    expect(!!readOnlyElement).toBeTruthy();
    expect(page1Text).toEqual(page2Text);
    expect(title2IsEditable).toBeFalsy();
  });

  test('Invite another user to notepad as contributor', async () => {
    const page2 = await context2.newPage();
    const testUser2 = await setUp({ page: page2, context: context2 });
    await page1.getByTestId('publish-button').click();
    await page1.getByPlaceholder('Enter email address').fill(testUser2.email);
    await page1.getByPlaceholder('Enter email address').focus();
    await page1.getByTestId('send-invitation').click();

    await page2.goto(page1.url());
    const titleElementPage1 = page1.getByTestId('editor-title');
    const titleElementPage2 = page2.getByTestId('editor-title');
    const page1Text = await titleElementPage1.textContent();
    const page2Text = await titleElementPage2.textContent();
    const title2Editable = await titleElementPage2.evaluate(
      (e: HTMLElement) => e.isContentEditable
    );
    await titleElementPage2.focus();
    await page2.keyboard.press('ArrowDown');
    await page2.keyboard.insertText('Hello, World! Sent from user 2!');
    const user2Text = page1.getByText('Hello, World!, Sent from user 2!');

    expect(page1Text).toEqual(page2Text);
    expect(title2Editable).toBeTruthy();
    expect(!!user2Text).toBeTruthy();
  });
});
