import { expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  goToPlayground,
  waitForEditorToLoad,
} from '../utils/page/Editor';

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

    const dropdownOptions = page.locator('[data-testid="dropdownOption"]');
    expect(await dropdownOptions.count()).toBe(1);
  });

  test('Add another option to dropdown', async () => {
    const addNew = page.locator('text=Add new');
    await addNew.click();

    // Dropdown should autofocus on input
    await page.keyboard.type('75%');
    await page.keyboard.press('Enter');

    const dropdownOptions = page.locator('[data-testid="dropdownOption"]');
    expect(await dropdownOptions.count()).toBe(2);
  });

  test('Select option', async () => {
    const textEl = page.locator('text=50%');
    await textEl.click();
    const dropdownOptions = page.locator('[data-testid="dropdownOption"]');

    // Dropdown should have hidden.
    expect(await dropdownOptions.count()).toBe(0);

    expect(await textEl.isVisible()).toBeTruthy();
  });
});
