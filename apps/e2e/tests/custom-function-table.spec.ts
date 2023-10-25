import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import {
  createTable,
  getFromTable,
  openColTypeMenu,
  writeInTable,
} from '../utils/page/Table';
import { Timeouts } from '../utils/src/timeout';
import { createCalculationBlockBelow } from '../utils/page/Block';

test.describe('Custom function Table', () => {
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
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates table', async () => {
    await focusOnBody(page);
    await createTable(page);
  });

  test('fills table', async () => {
    // first column
    await writeInTable(page, '1', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('1');
    await writeInTable(page, '2', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('2');
    await writeInTable(page, '3', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('3');
  });

  test('Creates custom formula', async () => {
    await createCalculationBlockBelow(page, 'add5(number) = number + 5');
    await page.waitForSelector(':text("ƒ")');
  });

  test('can change column type to a formula', async () => {
    await openColTypeMenu(page, 2);
    await page.getByRole('menuitem', { name: 'Formula Formula' }).click();
  });

  test('uses custom formula on table', async () => {
    await page
      .getByRole('code')
      .filter({ hasText: 'FormulaColumn3 =' })
      .click();
    await page.keyboard.type('add5(');
    await page.keyboard.type('Column1');
    // to add a smart referance
    await page.keyboard.press('Enter');
    await page.keyboard.type(')');
  });

  test('checks for errors', async () => {
    await expect(async () => {
      expect(await page.getByTestId('code-line-warning').count()).toBe(0);
    }).toPass();
  });

  test('reload page', async () => {
    page.reload();
  });

  test('hide and show table', async () => {
    await page.getByTestId('segment-button-trigger-table').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.getByTestId('segment-button-trigger-table').click();
  });

  test('checks for again', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    // check that no calculations broke due to broken asl
    expect(await page.getByTestId('code-line-warning').count()).toBe(0);
  });
});
