import { expect, Page, test } from '@playwright/test';
import { createToggleBelow } from '../utils/page/Block';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';

test.describe('Tests Widgets', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('can create a toggle', async () => {
    await focusOnBody(page);
    await createToggleBelow(page, 'Input2');
    await keyPress(page, 'ArrowRight');
    await expect(page.locator('text=Input2')).toBeVisible();
    await expect(page.locator('text=Off')).toBeVisible();
  });

  test('can turn on toggle', async () => {
    await page.getByTestId('widget-editor').getByRole('button').nth(2).click();
    await expect(page.locator('text=On')).toBeVisible();
  });

  test('can turn off toggle', async () => {
    await page.getByTestId('widget-editor').getByRole('button').nth(2).click();
    await expect(page.locator('text=Off')).toBeVisible();
  });
});
