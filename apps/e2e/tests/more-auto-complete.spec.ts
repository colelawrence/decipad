import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import {
  addColumn,
  createTable,
  renameColumn,
  writeInTable,
} from '../utils/page/Table';
import { createCodeLineV2Below } from '../utils/page/Block';
import { Timeouts, createWorkspace } from '../utils/src';

test.describe('Make sure auto-complete works', () => {
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

  test('Creates a table and creates a formula', async () => {
    // Creates a table and fills it
    await createTable(page);

    await renameColumn(page, 0, 'Name');
    await renameColumn(page, 1, 'Revenue');
    await renameColumn(page, 2, 'Total');

    await writeInTable(page, 'one', 1);
    await writeInTable(page, 'two', 2);
    await writeInTable(page, 'three', 3);

    await writeInTable(page, '1', 1, 1);
    await writeInTable(page, '2', 2, 1);
    await writeInTable(page, '3', 3, 1);

    // Creates formula and fills it
    await createCodeLineV2Below(page, 'Revenue', '100');
  });

  test('Checks if the revenue variable is linked properly', async () => {
    await createCodeLineV2Below(page, 'Another', '');
    await page.getByTestId('codeline-code').last().fill('Revenue');
    await page
      .getByTestId('autocomplete-group:Variables')
      .getByTestId('autocomplete-item:Revenue')
      .click();
    await expect(
      page.getByTestId('codeline-code').last().getByText('100')
    ).toBeVisible();
  });

  test('Enter table formula and checks for proper output', async () => {
    await writeInTable(page, '=', 1, 2);
    await page.getByTestId('code-line').last().fill('Revenue');
    await page
      .getByTestId('autocomplete-group:Variables')
      .getByTestId('autocomplete-item:Revenue')
      .click();
    await page.getByTestId('code-line').last().click();
    await page.keyboard.type(' + Revenue');
    await page
      .getByTestId('autocomplete-group:Table')
      .getByTestId('autocomplete-item:Revenue')
      .click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(
      page.getByTestId('editor-table').getByTestId('number-result:101')
    ).toBeVisible();
  });

  test('New table with revenueNew', async () => {
    // Creates a new formula for RevenueNew
    await createCodeLineV2Below(page, 'RevenueNew', '100');

    // Creates a new table and fills it
    await createTable(page);

    await renameColumn(page, 0, 'name', 'Table2');
    await renameColumn(page, 1, 'RevenueNew', 'Table2');
    await renameColumn(page, 2, 'total', 'Table2');

    await writeInTable(page, 'one', 1, 0, 'Table2');
    await writeInTable(page, 'two', 2, 0, 'Table2');
    await writeInTable(page, 'three', 3, 0, 'Table2');

    await writeInTable(page, '1', 1, 1, 'Table2');
    await writeInTable(page, '2', 2, 1, 'Table2');
    await writeInTable(page, '3', 3, 1, 'Table2');
  });

  test('Tests formulas with RevenueNew table', async () => {
    // Checks sum()
    await writeInTable(page, '=', 1, 2, 'Table2');
    await page.getByTestId('code-line').last().click();
    await page.keyboard.type('sum(Table2.RevenueNew)');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(page.getByTitle('Error')).toBeHidden();

    // Checks previous()
    await addColumn(page, 'Table2');
    await writeInTable(page, '=', 1, 3, 'Table2');
    await page.getByTestId('code-line').last().click();
    await page.keyboard.type('(RevenueNew');
    await page
      .getByTestId('autocomplete-group:Variables')
      .getByTestId('autocomplete-item:RevenueNew')
      .click();
    await page.keyboard.type('/ previous(0, RevenueNew');
    await page
      .getByTestId('autocomplete-group:Table2')
      .getByTestId('autocomplete-item:RevenueNew')
      .click({ timeout: Timeouts.maxSelectorWaitTime });
    await page.keyboard.type(')) - 1 in %');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    // Any error in the formulas will fail this test
    await expect(page.getByTitle('Error')).toBeHidden();
  });
});
