import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { Timeouts, createWorkspace } from '../utils/src';
import { clickCell, writeInTable } from '../utils/page/Table';

const checkForError = (page: Page, value: string, row: number, col: number) =>
  test.step(`Checking for error`, async () => {
    await page.getByTestId('notebook-title').click();
    await writeInTable(page, value, row, col);
    await page.getByText(value).hover();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await expect(page.getByText('Cannot parse')).toBeHidden();
  });

const changeToGBP = (page: Page, nth: number) =>
  test.step(`Checking for error`, async () => {
    await page.getByTestId('table-column-menu-button').nth(nth).click();
    await page.getByTestId('trigger-menu-item').getByText('Currency').click();
    await page.getByText('Currency').click();
    await page.getByText('GBP').click();
  });

test.describe('Make sure deleting decimals does not break parsing', () => {
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

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Creates a table and sets a value', async () => {
    // Creates a table and fills it
    await page.getByTestId('paragraph-content').last().fill('/');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await page.getByTestId('menu-item-table').first().click();

    await writeInTable(page, '13.21', 1);
    await changeToGBP(page, 0);
  });

  test('Causes error by deleting values', async () => {
    await clickCell(page, 1);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Backspace');
    await clickCell(page, 2);
    await clickCell(page, 1);
    await page.getByText('13.').hover();
    // RGB 600, tooltips are too flaky to be tested
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    const color = await page
      .getByText('13.')
      .first()
      .evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('color')
      );
    await expect(color).toBe('rgb(192, 55, 55)');
  });

  test('Checks other cells', async () => {
    await checkForError(page, '13.21', 2, 0);
  });

  test('Checks other column', async () => {
    await changeToGBP(page, 1);
    await checkForError(page, '13.22', 1, 1);
  });

  test('Tests if adding the number back fixes parsing error', async () => {
    await clickCell(page, 1);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('25');
    await page.getByText('13.25').hover();
    // RGB 600, tooltips are too flaky to be tested
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    const color = await page
      .getByText('13.25')
      .first()
      .evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('color')
      );
    await expect(color).not.toBe('rgb(192, 55, 55)');
  });
});
