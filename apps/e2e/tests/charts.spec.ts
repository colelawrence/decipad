import { createTable, getFromTable, writeInTable } from '../utils/page/Table';
import { Timeouts, snapshot } from '../utils/src';
import type { Page } from './manager/decipad-tests';
import { expect, test } from './manager/decipad-tests';

import notebookSource from '../__fixtures__/002-notebook-charts.json';

test('Charts', async ({ testUser: { page, notebook } }) => {
  await test.step('creates table', async () => {
    await notebook.focusOnBody();
    await createTable(page);
  });

  await test.step('fills table', async () => {
    // first column
    await writeInTable(page, 'Imports', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('Imports');
    await writeInTable(page, 'Hydro, wind and solar', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('Hydro, wind and solar');
    await writeInTable(page, 'Bioenergy', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('Bioenergy');

    // second column
    await writeInTable(page, '0.68%', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('0.68%');
    await writeInTable(page, '3.02%', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('3.02%');
    await writeInTable(page, '9.32%', 3, 1);
    expect(await getFromTable(page, 3, 1)).toBe('9.32%');
  });

  await test.step('creates a pie chart', async () => {
    await page.getByTestId('create-chart-from-table-button').click();
    await page.getByTestId('create-chart:arc').click();

    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight * 2)
    );
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
  });

  await test.step('pie chart looks ok', async () => {
    await page.evaluate(() => document.fonts.ready);
  });

  await test.step('pie chart menu', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
  });

  await test.step('change color scheme', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByText('Color scheme').click();
    await page.getByText(/^Monochrome$/).click();
    await page.getByText('Purple').click();
  });

  await test.step('convert to bar chart', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
    await page.getByText('Chart type').click();
    await page.getByTestId('chart__settings__chart-type__bar').click();
  });

  await test.step('bar chart menu', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.getByTestId('chart-settings-button').click();
  });

  await test.step('swap axes', async () => {
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator('[data-testid="trigger-menu-item"]')
      .getByText('Category')
      .click();
    await page.getByTestId('chart__settings__xcolumn__Column2').click();
    await page.getByTestId('chart-settings-button').click();
    await page.getByText('Add Value 𝑦').click();
    await page.getByTestId('chart__settings__add_moar__Column1').click();
  });
});

test('check notebook with charts @snapshot', async ({
  testUser,
  anotherTestUser,
  unregisteredUser,
}) => {
  test.slow();
  const notebookId = await testUser.importNotebook(notebookSource);

  await test.step('navigates to notebook and loads it', async () => {
    await testUser.importNotebook(notebookSource);
    await testUser.navigateToNotebook(notebookId);
    await testUser.notebook.waitForEditorToLoad();
    await testUser.notebook.checkNotebookTitle(
      'Testing Visual Regression Charts'
    );

    await testUser.page.getByText('Start Test Here').waitFor();
    await testUser.page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(testUser.page as Page, 'Notebook: Charts');
    await testUser.notebook.publishNotebook();
  });

  await test.step('a random user can duplicate', async () => {
    await anotherTestUser.navigateToNotebook(notebookId);
    await anotherTestUser.page.getByText('Duplicate notebook').click();
    await anotherTestUser.notebook.waitForEditorToLoad();
    await anotherTestUser.notebook.checkNotebookTitle(
      'Copy of Testing Visual Regression Charts'
    );
  });

  await test.step('logged out user can check out charts', async () => {
    await unregisteredUser.navigateToNotebook(notebookId);
    await unregisteredUser.notebook.waitForEditorToLoad();

    // wait for charts to load before snapshot
    await unregisteredUser.page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await unregisteredUser.page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(
      unregisteredUser.page,
      'Notebook: Charts Published mode (incognito)',
      {
        mobile: true,
      }
    );
  });
});
