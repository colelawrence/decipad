import { BrowserContext, expect, Page, test } from '@playwright/test';
import { createInputBelow, createToggleBelow } from '../utils/page/Block';
import { keyPress, setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { Timeouts } from '../utils/src';

test.describe('Turn Into', () => {
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

  test('Converts between widgets with different elements and sizes', async () => {
    await keyPress(page, 'ArrowDown');
    await createInputBelow(page, 'Input1', 'true');

    await expect(await page.getByRole('slider')).toBeHidden();
    await expect(await page.getByRole('checkbox')).toBeHidden();

    await page.click('[data-testid=drag-handle]');
    await page.locator('role=menuitem', { hasText: 'turn into' }).hover();
    await page.locator('role=menuitem', { hasText: 'slider' }).click();

    await expect(await page.getByRole('slider')).toBeVisible();

    await page.click('[data-testid=drag-handle]');
    await page.locator('role=menuitem', { hasText: 'turn into' }).hover();
    await page.locator('role=menuitem', { hasText: 'toggle' }).click();

    await expect(await page.getByRole('checkbox')).toBeVisible();
  });

  test('Converts a Widget into a structured input', async () => {
    await keyPress(page, 'ArrowDown');
    await createToggleBelow(page, 'Input2');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await expect(await page.getByText('Off', { exact: true })).toBeVisible();

    await page.click('[data-testid=drag-handle] >> nth=1');
    await page.locator('role=menuitem', { hasText: 'turn into' }).hover();
    await page.locator('role=menuitem', { hasText: 'calculation' }).click();

    await expect(await page.getByText('Off', { exact: true })).toBeHidden();
    await expect(
      page.locator('[data-testid="codeline-varname"] >> nth=-1')
    ).toContainText('Input2');
    await expect(
      page.locator('[data-testid="codeline-code"] >> nth=-1')
    ).toContainText('false');
  });
});
