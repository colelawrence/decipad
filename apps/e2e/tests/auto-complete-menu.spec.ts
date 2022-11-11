import { test } from '@playwright/test';
import { BrowserContext, Page } from 'playwright-core';
import { createCalculationBlockBelow } from '../utils/page/Block';
import { keyPress, setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Auto complete menu', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates a variable', async () => {
    await createCalculationBlockBelow(page, 'MyVar = 68 + 1');
    await keyPress(page, 'Enter');
    await createCalculationBlockBelow(page, 'OtherVare = 419 + 1');
    await page.waitForSelector("span:has-text('69')");
  });

  test('opens menu when cursor is at the end of a word', async () => {
    await createCalculationBlockBelow(page, 'MyV');
    await page.waitForSelector('text=Press Esc to dismiss');
    // Wait for result to appear. Avoids flaky snapshots.
    await page.waitForSelector("span:has-text('1 MyV')");
    await snapshot(page as Page, 'Auto Complete Menu: Open');
  });

  test('filters menu based on word before cursor', async () => {
    await page.waitForSelector(
      ".test-auto-complete-menu button:has-text('MyVar'):first-child:last-child"
    );
  });

  test('completes the name of the variable on click', async () => {
    await page.click(".test-auto-complete-menu button:has-text('MyVar')");
    await page.waitForSelector("code:has-text('MyVar')");
  });
});
