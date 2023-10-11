import { BrowserContext, Page, test, expect } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import {
  createTable,
  changeColumnYear,
  clickCell,
  tableCellLocator,
  changeColumnMonth,
  changeColumnDay,
  addColumn,
} from '../utils/page/Table';
import { snapshot } from '../utils/src';

test.describe('tests table date pickers', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let col;
  let line;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

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

  test('checks table year picker', async () => {
    await focusOnBody(page);
    await createTable(page);
    line = 1;
    col = 1;
    await changeColumnYear(page, col);
    await clickCell(page, line, col);

    await page.getByText('Today').isVisible();
    await snapshot(page as Page, 'Tables: Year Picker');
    await page.getByText('Today').click();
    await expect(page.locator(tableCellLocator(col, line))).toContainText(
      `${year}`
    );
  });

  test('checks table month picker', async () => {
    line = 1;
    col = 2;
    await changeColumnMonth(page, col);
    await clickCell(page, line, col);

    await page.getByText('Today').isVisible();
    await snapshot(page as Page, 'Tables: Month Picker');
    await page.getByText('Today').click();

    await expect(page.locator(tableCellLocator(line, col))).toContainText(
      `${year}-${month}`
    );
  });

  test('checks table day picker', async () => {
    line = 1;
    col = 3;
    await addColumn(page);
    await changeColumnDay(page, col);
    await clickCell(page, line, col);

    // skipping snapshot since the modal is the same as the date widget
    await page.getByText('Today').click();

    await expect(page.locator(tableCellLocator(line, col))).toContainText(
      `${year}-${month}-${day}`
    );
  });
});
