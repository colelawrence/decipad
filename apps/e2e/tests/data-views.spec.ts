import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, keyPress, setUp } from '../utils/page/Editor';
import { createTable, writeInTable } from '../utils/page/Table';

test.describe('Data views', () => {
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

  test('creates table"', async () => {
    await focusOnBody(page);
    await page.keyboard.insertText('This is some text.');
    await keyPress(page, 'Enter');
    await createTable(page);
  });

  test('fills table"', async () => {
    // first column
    await writeInTable(page, 'a', 1, 0);
    await writeInTable(page, 'b', 2, 0);
    await writeInTable(page, 'a', 3, 0);

    // second column
    await writeInTable(page, '1', 1, 1);
    await writeInTable(page, '2', 2, 1);
    await writeInTable(page, '2', 3, 1);

    // third column
    await writeInTable(page, '3', 1, 2);
    await writeInTable(page, '4', 2, 2);
    await writeInTable(page, '5', 3, 2);
  });

  test('creates data view', async () => {
    await page.locator('text=Create view').click();
  });

  test('selects columns on data view', async () => {
    const addButton = page.getByTestId('add-data-view-column-button');
    await addButton.click();
    await page.getByTestId('data-view-menu-item-Column1').click();

    await addButton.click();
    await page.getByTestId('data-view-menu-item-Column2').click();

    await addButton.click();
    await page.getByTestId('data-view-menu-item-Column3').click();
  });

  test('data view configuration', async () => {
    // wait for results debounce
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1000);
    const dataViewContent = await page
      .locator('[aria-roledescription="data view data"]')
      .screenshot();
    expect(dataViewContent).toMatchSnapshot('data-view-after-columns.png');
  });

  test('expand data view group', async () => {
    await page
      .locator('role=cell[name="a Folder"] >> span:has-text("Folder")')
      .click();
    // wait for results debounce
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1000);
    const dataViewContent = await page
      .locator('[aria-roledescription="data view data"]')
      .screenshot();
    expect(dataViewContent).toMatchSnapshot('data-view-after-expansion.png');
  });

  test('set aggregations', async () => {
    await page
      .locator(
        'role=cell[name="Drag Handle Column2 Caret down"] >> role=button[name="Caret down"]'
      )
      .click();
    await page.locator('text=Aggregate').click();
    await page.locator('text=Sum').click();

    await page
      .locator(
        'role=cell[name="Drag Handle Column3 Caret down"] >> role=button[name="Caret down"]'
      )
      .click();
    await page.locator('text=Aggregate').click();
    await page.locator('text=Average').click();
    // wait for results debounce
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1000);
    const dataViewContent = await page
      .locator('[aria-roledescription="data view data"]')
      .screenshot();

    expect(dataViewContent).toMatchSnapshot(
      'data-view-after-setting-aggregations.png'
    );
  });
});
