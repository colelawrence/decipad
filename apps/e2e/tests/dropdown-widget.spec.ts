import { expect, Page, test } from '@playwright/test';
import { goToPlayground, waitForEditorToLoad } from '../utils/page/Editor';
import {
  clickCell,
  createTable,
  openColTypeMenu,
  tableCellLocator,
} from '../utils/page/Table';
import { createDropdownBelow } from '../utils/page/Block';

test.describe('Dropdown widget', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates an empty dropdown widget', async () => {
    await createDropdownBelow(page, 'Dropdown');
    expect(await page.getByText('Dropdown').count()).toBe(1);
  });

  test('Open dropdown and view box to add option', async () => {
    await page.getByText('Select').click();
    await expect(page.locator('div >> div >> input')).toBeVisible();
  });

  test('New option gets added to list', async () => {
    // Input box should be focused, so we can just start typing
    await page.keyboard.type('50%');
    await page.keyboard.press('Enter');

    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );
    expect(await dropdownOptions.count()).toBe(1);
  });

  test('Add another option to dropdown', async () => {
    const addNew = page.getByText('Add new');
    await addNew.click();

    // Dropdown should autofocus on input
    await page.keyboard.type('75%');
    await page.keyboard.press('Enter');

    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );
    expect(await dropdownOptions.count()).toBe(2);
  });

  test('Select option', async () => {
    const textEl = page.getByText('50%');
    await textEl.click();
    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );

    // Dropdown should have hidden.
    expect(await dropdownOptions.count()).toBe(0);
  });

  test('Dropdown option should appear in table column menu', async () => {
    await createTable(page);
    await openColTypeMenu(page, 2);
    await expect(
      page.getByRole('menuitem').getByText('Categories')
    ).toBeVisible();
  });

  test('You can open dropdown in the cell', async () => {
    await page.getByRole('menuitem').getByText('Categories').click();
    await page.getByRole('menuitem').getByText('Dropdown').click();

    await page.waitForSelector('[aria-roledescription="dropdown-editor"]');
    await clickCell(page, 1, 2);

    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );
    expect(await dropdownOptions.count()).toBe(2);
    await page
      .locator('[aria-roledescription="dropdownOption"]')
      .getByText('50%')
      .click();
    await expect(dropdownOptions).toBeHidden();
    await expect(page.locator(tableCellLocator(1, 2))).toContainText('50%');
  });

  test('Changing original dropdown value, also changes the cells value', async () => {
    await page.locator('[aria-roledescription="dropdown-open"]').click();

    await page
      .locator('[aria-roledescription="dropdownOption"]')
      .getByText('50%')
      .hover();

    await page
      .getByRole('complementary')
      .locator('div')
      .filter({ hasText: 'Edit' })
      .click();

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.insertText('0');
    await page.keyboard.press('Enter');

    await expect(page.locator(tableCellLocator(1, 2))).toHaveText(/500%/, {
      timeout: 5000,
    });
  });
});
