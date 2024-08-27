import { test, expect } from './manager/decipad-tests';
import {
  addColumn,
  createTable,
  getFromTable,
  renameColumn,
  updateDataType,
  writeInTable,
} from '../utils/page/Table';

test('Data Views', async ({ testUser: { page, notebook } }) => {
  await test.step('creates table', async () => {
    await notebook.focusOnBody();
    await createTable(page);
  });

  await test.step('fills table', async () => {
    // first column
    await renameColumn(page, 0, 'Year');
    await updateDataType(page, 0, undefined, 'menulist-dates', 'menuitem-year');
    await writeInTable(page, '2024', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('2024');
    await writeInTable(page, '2024', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('2024');
    await writeInTable(page, '2024', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('2024');

    // second column
    await renameColumn(page, 1, 'Month');
    await updateDataType(
      page,
      1,
      undefined,
      'menulist-dates',
      'menuitem-date-sequence'
    );
    await writeInTable(page, '2024-01', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('2024-01');
    expect(await getFromTable(page, 2, 1)).toBe('2024-02');
    expect(await getFromTable(page, 3, 1)).toBe('2024-03');

    // third column
    await renameColumn(page, 2, 'Expenses');
    await writeInTable(page, '1500$', 1, 2);
    expect(await getFromTable(page, 1, 2)).toBe('1500$');
    await writeInTable(page, '2750$', 2, 2);
    expect(await getFromTable(page, 2, 2)).toBe('2750$');
    await writeInTable(page, '1300$', 3, 2);
    expect(await getFromTable(page, 3, 2)).toBe('1300$');
  });

  await test.step('creates a data view', async () => {
    await page.getByText('Pivot view').click();

    await expect(page.getByText('TableData')).toBeVisible();

    await notebook.checkCalculationErrors();
  });

  await test.step('show data on the data view', async () => {
    await expect(page.getByTestId('add-data-view-column-button')).toBeVisible();

    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Year' }).click();
    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Month' }).click();
    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Expenses' }).click();

    await page.getByTestId('data-view-options-menu-Month').click();
    await page.getByRole('menuitem', { name: 'Aggregate' }).click();
    await page.getByRole('menuitem', { name: 'Time span' }).click();

    await notebook.checkCalculationErrors();
  });

  await test.step('check data view values are correct', async () => {
    await expect(
      page
        .locator('output')
        .first()
        .filter({ hasText: 'Span:' })
        .getByTestId('number-result:2 months')
    ).toBeVisible();
  });

  await test.step('adds column to a table', async () => {
    await addColumn(page, 'Table');

    await notebook.checkCalculationErrors();
  });
});
