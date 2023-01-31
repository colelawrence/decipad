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
    const addButton = page.locator('button[aria-roledescription="Add column"]');
    await addButton.click();
    await page
      .locator('role=menuitem[name="Property1"] >> text=Property1')
      .click();

    await addButton.click();
    await page
      .locator('role=menuitem[name="Property2"] >> text=Property2')
      .click();

    await addButton.click();
    await page
      .locator('role=menuitem[name="Property3"] >> text=Property3')
      .click();
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
    await page.click('role=cell[name="a Folder"] >> span:has-text("Folder")');
    // wait for results debounce
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1000);
    const dataViewContent = await page
      .locator('[aria-roledescription="data view data"]')
      .screenshot();
    expect(dataViewContent).toMatchSnapshot('data-view-after-expansion.png');
  });

  test('set aggregations', async () => {
    await page.click(
      'role=cell[name="Drag Handle Property2 Caret down"] >> role=button[name="Caret down"]'
    );
    await page.click('text=Aggregate');
    await page.click('text=Sum');

    await page.click(
      'role=cell[name="Drag Handle Property3 Caret down"] >> role=button[name="Caret down"]'
    );
    await page.click('text=Aggregate');
    await page.click('text=Average');
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
