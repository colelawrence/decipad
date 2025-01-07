import { expect, test } from './manager/decipad-tests';
import {
  createTable,
  getFromTable,
  openColTypeMenu,
  writeInTable,
} from '../utils/page/Table';
import { Timeouts } from '../utils/src/timeout';

test('Custom function Table', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('creates table', async () => {
    await notebook.focusOnBody();
    await createTable(page);
  });

  await test.step('fills table', async () => {
    // first column
    await writeInTable(page, '1', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('1');
    await writeInTable(page, '2', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('2');
    await writeInTable(page, '3', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('3');
  });

  await test.step('Creates custom formula', async () => {
    await notebook.addAdvancedFormula('add5(number) = number + 5');
    // eslint-disable-next-line playwright/no-wait-for-selector
    await page.waitForSelector(':text("ƒ")');
  });

  await test.step('can change column type to a formula', async () => {
    await openColTypeMenu(page, 2);
    await page.getByRole('menuitem', { name: 'Formula' }).click();
  });

  await test.step('uses custom formula on table', async () => {
    await page.getByRole('code').filter({ hasText: 'Column3 =' }).click();
    await page.keyboard.type('add5(');
    await page.keyboard.type('Column1');
    // to add a smart reference
    await page.keyboard.press('Enter');
    await page.keyboard.type(')');
  });

  await test.step('checks for errors', async () => {
    await expect(async () => {
      expect(await page.getByTestId('code-line-warning').count()).toBe(0);
    }).toPass();
  });

  await test.step('reload page', async () => {
    await page.reload();
  });

  await test.step('hide and show table', async () => {
    await page.getByTestId('segment-button-trigger-table').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.getByTestId('segment-button-trigger-table').click();
  });

  await test.step('checks for again', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    // check that no calculations broke due to broken asl
    expect(await page.getByTestId('code-line-warning').count()).toBe(0);
  });
});
