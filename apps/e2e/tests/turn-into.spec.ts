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
    context = page.context();
    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Converts between widgets with different elements and sizes', async () => {
    await page.keyboard.press('ArrowDown');
    await createInputBelow(page, 'Input1', 'true');

    await expect(page.getByRole('slider')).toBeHidden();
    await expect(page.getByRole('checkbox')).toBeHidden();

    await page.getByTestId('drag-handle').first().click();
    await page.getByRole('menuitem').getByText('turn into').hover();
    await page.getByRole('menuitem').getByText('slider').click();

    await expect(page.getByRole('slider')).toBeVisible();

    await page.getByTestId('drag-handle').first().click();
    await page.getByRole('menuitem').getByText('turn into').hover();
    await page.getByRole('menuitem').getByText('toggle').click();

    await expect(page.getByRole('checkbox')).toBeVisible();
  });

  test('Converts a Widget into a structured input', async () => {
    await keyPress(page, 'ArrowDown');
    await createToggleBelow(page, 'Input2');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await expect(
      page.getByText('false', { exact: true }).first()
    ).toBeVisible();

    await page.getByTestId('drag-handle').nth(1).click();
    await page.getByRole('menuitem').getByText('turn into').hover();
    await page.getByRole('menuitem').getByText('calculation').click();

    await expect(page.getByTestId('codeline-varname').nth(-1)).toContainText(
      'Input2'
    );
    await expect(page.getByTestId('codeline-code').nth(-1)).toContainText(
      'false'
    );
  });
});
