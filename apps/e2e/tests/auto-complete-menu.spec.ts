import { BrowserContext, Page, expect, test } from '@playwright/test';
import { createCalculationBlockBelow } from '../utils/page/Block';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Auto complete menu', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates a variable', async () => {
    await createCalculationBlockBelow(page, 'MyVar = 68 + 1');
    await expect(
      page.getByTestId('code-line').getByTestId('number-result:69')
    ).toBeVisible();
    await createCalculationBlockBelow(page, 'OtherVare = 419 + 1');
    await expect(
      page.getByTestId('code-line').getByTestId('number-result:420')
    ).toBeVisible();
  });

  test('opens menu when cursor is at the end of a word', async () => {
    await createCalculationBlockBelow(page, 'MyV');
    await expect(page.getByTestId('autocomplete-tooltip')).toBeVisible();
    // Wait for result to appear. Avoids flaky snapshots.
    await page
      .getByTestId('autocomplete-group:Variables')
      .getByText('MyVar')
      .waitFor();
    await snapshot(page as Page, 'Auto Complete Menu: Open');
  });

  test('filters menu based on word before cursor', async () => {
    await expect(
      page.getByTestId('autocomplete-group:Variables').getByText('MyVar')
    ).toBeVisible();
  });

  test('completes the name of the variable on click', async () => {
    await page
      .getByTestId('autocomplete-group:Variables')
      .getByText('MyVar')
      .click();
    await expect(page.getByTestId('code-line').getByText('MyVar')).toHaveCount(
      2
    );
  });
});
