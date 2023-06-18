import { expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  goToPlayground,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import {
  clickCell,
  createTable,
  openColTypeMenu,
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
    await page.locator('[data-testid="menu-item-dropdown"]').click();

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
    await openColTypeMenu(page, 2);

    const dropdownMenu = page.locator(
      '[role="menuitem"]:has-text("Categories")'
    );
    await expect(dropdownMenu).toBeVisible();
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

    await expect(dropdownOptions).toBeHidden();
    await expect(page.locator(tableCellLocator(1, 2))).toContainText('50%');
  });

  test('Changing original dropdown value, also changes the cells value', async () => {
    await page.locator('[aria-roledescription="dropdown-open"]').click();

    await page
      .locator('[aria-roledescription="dropdownOption"]:has-text("50%")')
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
