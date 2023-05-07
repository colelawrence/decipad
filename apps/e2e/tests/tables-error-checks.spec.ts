import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp, ControlPlus } from '../utils/page/Editor';
import { Timeouts } from '../utils/src';
import { createTable, writeInTable, getFromTable } from '../utils/page/Table';

test.describe('Number Parcing Checks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let url: string;

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

  test('setup new notebook', async () => {
    await focusOnBody(page);
  });

  // can't make copy and paste work on our tests
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip('copy google sheet table', async () => {
    url = await page.url();
    await page.goto(
      'https://docs.google.com/spreadsheets/d/1CimD6WcVrqqyqI7u7LqOmDIbfDYdh6SIhyUdLfnPQM0/edit#gid=0'
    );
    await page.locator('#waffle-rich-text-editor').press('ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowDown');
    await page.locator('#waffle-rich-text-editor').press('Shift+ArrowRight');
    await page.locator('#waffle-rich-text-editor');
    await ControlPlus(page, 'C');
    await page.goto(url);
    await focusOnBody(page);
    await page.getByTestId('paragraph-content').click();
    await ControlPlus(page, 'V');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
  });

  test('create table', async () => {
    await createTable(page);
    await writeInTable(page, 'Thousand', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('Thousand');
    await writeInTable(page, '$1,000.00', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('$1,000.00');
    await writeInTable(page, 'Million', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('Million');
    await writeInTable(page, '$1,000,000.00', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('$1,000,000.00');
    await writeInTable(page, 'Billion', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('Billion');
    await writeInTable(page, '$1,000,000,000.00', 3, 1);
    expect(await getFromTable(page, 3, 1)).toBe('$1,000,000,000.00');
  });

  test('update data type to number', async () => {
    await page
      .getByRole('cell', { name: 'Column2' })
      .getByTestId('table-column-menu-button')
      .click();
    await page.getByRole('menuitem', { name: 'Change type' }).click();
    await page.getByRole('menuitem', { name: 'Number' }).click();
    await focusOnBody(page);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.getByText('$1,000,000,000.00').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await expect(
      page.getByText('Cannot parse number out of "$1,000,000,000.00"')
    ).toContainText('Cannot parse number out of "$1,000,000,000.00');
  });
});
