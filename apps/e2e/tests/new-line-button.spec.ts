import { BrowserContext, expect, Page, test } from '@playwright/test';
import { createCodeLineV2Below } from '../utils/page/Block';
import { focusOnBody, keyPress, setUp } from '../utils/page/Editor';
import { createTable, getFromTable, writeInTable } from '../utils/page/Table';

test.describe('Basic + button to insert new line', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

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

  test('creates structured input', async () => {
    await focusOnBody(page);
    const lineText = '1 + 1';
    await createCodeLineV2Below(page, 'MyVariable', lineText);
  });

  test('creates table', async () => {
    await keyPress(page, 'Enter');
    await createTable(page);
  });

  test('fills table', async () => {
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

  test('add table row', async () => {
    await page.getByRole('button', { name: 'Add row' }).click();
  });

  test('press + button after structured input', async () => {
    // first column
    await page
      .getByRole('button')
      .filter({ hasText: /^Create$/ })
      .nth(1)
      .click();
  });

  test('press + button after table', async () => {
    // first column
    await page
      .getByRole('button')
      .filter({ hasText: /^Create$/ })
      .nth(3)
      .click();

    // Check only two structure inputs were created and no structured input was added when we press the + button after the table
    await expect(page.getByTestId('codeline-code')).toHaveCount(2);
  });
});
