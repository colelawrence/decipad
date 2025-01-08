import { expect, test } from './manager/decipad-tests';
import {
  addColumn,
  clickCell,
  createTable,
  renameColumn,
  writeInTable,
} from '../utils/page/Table';
import { Timeouts } from '../utils/src';

test('Make sure auto-complete works', async ({ testUser }) => {
  const { page } = testUser;
  await test.step('Creates a table and creates a formula', async () => {
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
    await testUser.notebook.addFormula('Revenue', '100');
  });

  await test.step('Checks if the revenue variable is linked properly', async () => {
    await testUser.notebook.addFormula('Another', '100');
    await page.getByTestId('codeline-code').last().fill('');
    await page.keyboard.type('Revenue', { delay: 50 });
    await page
      .getByTestId('autocomplete-group:Variables')
      .getByTestId('autocomplete-item:Revenue')
      .click();
    await expect(
      page.getByTestId('codeline-code').last().getByText('100')
    ).toBeVisible();
  });

  await test.step('Enter table formula and checks for proper output', async () => {
    await clickCell(page, 1, 2);
    await page.keyboard.press('=');
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
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(
      page.getByTestId('editor-table').getByTestId('number-result:101')
    ).toBeVisible();
  });

  await test.step('New table with revenueNew', async () => {
    // Creates a new formula for RevenueNew
    await testUser.notebook.addFormula('RevenueNew', '100');

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

  await test.step('Tests formulas with RevenueNew table', async () => {
    // Checks sum()
    await clickCell(page, 1, 2, 'Table2');
    await page.keyboard.press('=');
    await page.getByTestId('code-line').last().click();
    await page.keyboard.type('sum(Table2.RevenueNew)');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await expect(page.getByTitle('Error')).toBeHidden();

    // Checks previous()
    await addColumn(page, 'Table2');
    await clickCell(page, 1, 3, 'Table2');
    await page.keyboard.press('=');
    await page.getByTestId('code-line').last().click();
    await page.keyboard.type('(RevenueNew');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await page
      .getByTestId('autocomplete-group:Variables')
      .getByRole('menuitem', { name: 'RevenueNew' })
      .click();

    await page.keyboard.type('/ previous(0, RevenueNew');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await page
      .getByRole('menuitem', { name: 'Table2.Table2.' })
      .click({ timeout: Timeouts.maxSelectorWaitTime });
    await page.keyboard.type(')) - 1 in %');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    // Any error in the formulas will fail this test
    await expect(page.getByTitle('Error')).toBeHidden();
  });
});
