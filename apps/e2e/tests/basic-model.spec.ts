import { expect, test } from './manager/decipad-tests';
import { focusOnBody } from '../utils/page/Editor';
import { createSliderBelow } from 'apps/e2e/utils/page/Block';
import {
  addColumn,
  createTable,
  focusOnTableColumnFormula,
  getFromTable,
  renameColumn,
  updateDataType,
  writeInTable,
} from 'apps/e2e/utils/page/Table';

const sanitise = (text: string | null) =>
  !!text && text.replaceAll(/[^a-zA-Z0-9£,.]/g, '');

test('Creating a basic model', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('Set editor title', async () => {
    await notebook.updateNotebookTitle('Compound Interest Calculator');
    await notebook.checkNotebookTitle('Compound Interest Calculator');
  });

  await test.step('Create input fields', async () => {
    await notebook.addInputWidget('InitialInvestment', '£1000');
    await page.keyboard.press('Enter');
    await notebook.addInputWidget('MonthlyContribution', '£100');
    await createSliderBelow(page, 'InterestRate', '5%', {
      min: 0,
      max: 100,
      step: 1,
    });
  });

  // resulting table should be the following, columns may not necessarily be in this order
  // | Index | Year | TotalInvested | TotalMoney | TotalProfit |
  // | 1     | 2023 | £1,100        | £1,150     | £50         |
  // | 2     | 2024 | £1,200        | £1,307.5   | £107.5      |
  // | 3     | 2025 | £1,300        | £1,472.88  | £172.88     |

  await test.step('Create Table', async () => {
    await focusOnBody(page);
    await createTable(page);

    await addColumn(page);
    await addColumn(page);

    await renameColumn(page, 0, 'Index');
    await updateDataType(page, 0, undefined, 'Numbers', 'Number Sequence');
    await writeInTable(page, '1', 1, 0);

    await renameColumn(page, 1, 'Year');
    await updateDataType(page, 1, undefined, 'Date', 'Date Sequence');
    await writeInTable(page, '2023', 1, 1);

    await renameColumn(page, 2, 'TotalInvested');
    await updateDataType(page, 2, undefined, 'Formula');
    await focusOnTableColumnFormula(page, 'TotalInvested');
    await page.keyboard.type(
      'previous(InitialInvestment) + MonthlyContribution'
    );

    await renameColumn(page, 3, 'TotalMoney');
    await updateDataType(page, 3, undefined, 'Formula');
    await focusOnTableColumnFormula(page, 'TotalMoney');
    await page.keyboard.type(
      '(previous(InitialInvestment) * (1 + InterestRate )) + MonthlyContribution'
    );

    await renameColumn(page, 4, 'TotalProfit');
    await updateDataType(page, 4, undefined, 'Formula');
    await focusOnTableColumnFormula(page, 'TotalProfit');
    await page.keyboard.type('TotalMoney - TotalInvested');
    await page.keyboard.press('Enter');

    // check second row values are correct
    const [index, year, totalInvested, totalMoney, totalProfit] =
      await Promise.all([
        getFromTable(page, 2, 0),
        getFromTable(page, 2, 1),
        getFromTable(page, 2, 2),
        getFromTable(page, 2, 3),
        getFromTable(page, 2, 4),
      ]);

    expect(sanitise(index)).toBe('2');
    expect(sanitise(year)).toBe('2024');
    expect(sanitise(totalInvested)).toBe('£1,200');
    expect(sanitise(totalMoney)).toBe('£1,307.5');
    expect(sanitise(totalProfit)).toBe('£107.5');
  });

  /* Todo skiping this while waiting on bug fix
  await test.step('Swap columns', async () => {
    await swapTableColumns(page, 0, 2);
    await swapTableColumns(page, 0, 3);

    const [totalInvested, index, totalMoney, year, totalProfit] =
     await Promise.all([
         getFromTable(page, 2, 0),
         getFromTable(page, 2, 1),
         getFromTable(page, 2, 2),
         getFromTable(page, 2, 3),
         getFromTable(page, 2, 4),
       ]);

    expect(sanitise(totalInvested)).toBe('£1,200');
    expect(sanitise(index)).toBe('2');
    expect(sanitise(year)).toBe('2024');
    expect(sanitise(totalMoney)).toBe('£1,307.5');
    expect(sanitise(totalProfit)).toBe('£107.5');
  });
  */

  /* Unlreated issue, John is going to fix this.
  await test.step('Reorder slides and add blocks', async () => {
    await page
      .getByTestId('drag-handle')
      .nth(1)
      .dragTo(page.getByTestId('drag-handle').nth(0));
    await page.getByTestId('plus-block-button').nth(0).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await notebook.deleteBlock(2);
    await expect(page.getByRole('menu')).toBeHidden();
    await page.getByTestId('plus-block-button').nth(1).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await notebook.deleteBlock(2);
    await expect(page.getByRole('menu')).toBeHidden();
  });

  await test.step('download table csv', async () => {
    const csvData = await downloadTableCSV(page, 'Table');
    expect(csvData).toBe(
      'Index,Year,TotalInvested (£),TotalProfit (£),TotalMoney (£)\n1,2023,1100,50,1150\n2,2024,1200,107.5,1307.5\n3,2025,1300,172.875,1472.875'
    );
  }); */
});
