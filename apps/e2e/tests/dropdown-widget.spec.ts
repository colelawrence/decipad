import { expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  goToPlayground,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import {
  createTable,
  openColumnMenu,
  clickCell,
  tableCellLocator,
} from '../utils/page/Table';

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
    await focusOnBody(page);
    await page.keyboard.type('/dropdown');
    await page.locator('button >> span >> svg').click();

    const result = page.locator('text=Dropdown');
    expect(await result.count()).toBe(1);
  });

  test('Open dropdown and view box to add option', async () => {
    const dropdown = page.locator('text=Select');
    await dropdown.click();

    const input = page.locator('div >> div >> input');
    await expect(input).toBeVisible();
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
    const addNew = page.locator('text=Add new');
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
    const textEl = page.locator('text=50%');
    await textEl.click();
    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );

    // Dropdown should have hidden.
    expect(await dropdownOptions.count()).toBe(0);
  });

  test('Dropdown option should appear in table column manu', async () => {
    await createTable(page);
    await openColumnMenu(page, 2);
    await page.click('[role="menuitem"]:has-text("Change type")');

    const dropdownMenu = page.locator(
      '[role="menuitem"]:has-text("Categories")'
    );
    expect(await dropdownMenu.isVisible()).toBeTruthy();
  });

  test('You can open dropdown in the cell', async () => {
    await page.click('[role="menuitem"]:has-text("Categories")');
    await page.click('[role="menuitem"]:has-text("Dropdown1")');

    await page.waitForSelector('[aria-roledescription="dropdown-editor"]');
    await clickCell(page, 1, 2);

    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );
    expect(await dropdownOptions.count()).toBe(2);

    await page.click('[aria-roledescription="dropdownOption"]:has-text("50%")');

    expect(await dropdownOptions.isVisible()).toBeFalsy();

    const dropdownCell = await page.waitForSelector(tableCellLocator(1, 2));
    expect(await dropdownCell.textContent()).toContain('50%');
  });

  test('Changing original dropdown value, also changes the cells value', async () => {
    const dropdownOpen = page.locator('[aria-roledescription="dropdown-open"]');
    await dropdownOpen.click();

    await page
      .locator('[aria-roledescription="dropdownOption"]:has-text("50%")')
      .hover();
    const dropdownOption = await page.waitForSelector(
      '[aria-roledescription="dropdown-edit"]'
    );
    await dropdownOption.click();

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.insertText('0');
    await page.keyboard.press('Enter');

    const dropdownCell = page.locator(tableCellLocator(1, 2));
    await expect(dropdownCell).toHaveText(/500%/, { timeout: 5000 });
  });
});
