import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';

test.describe('Section creation', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

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

  test('Creating a new section', async () => {
    await page.getByTestId('new-section-button').click();
    await page.getByPlaceholder('My section').fill('Section Creation Test 1');
    await page.getByTestId('color-section-button').nth(2).click();
    await page.getByRole('button', { name: 'Create Section' }).click();
    await expect(page.getByText('Section Creation Test 1')).toBeVisible();
  });

  test('Cancelling a new section', async () => {
    await page.getByTestId('new-section-button').click();
    await page.getByPlaceholder('My section').fill('Section Creation Test 2');
    await page.getByTestId('closable-modal').click();
    await expect(page.getByText('Section Creation Test 2')).toBeHidden();
  });
});
