import { expect, Page, test } from '@playwright/test';
import { createCalculationBlockBelow } from '../utils/page/Block';
import {
  focusOnBody,
  goToPlayground,
  waitForEditorToLoad,
} from '../utils/page/Editor';

test.describe('Results widgets', () => {
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

  test('creates an empty result widget', async () => {
    await focusOnBody(page);
    await page.keyboard.type('/result');
    await page.locator('[role="menuitem"] >> span >> svg').click();
    await expect(page.getByText('Result')).toHaveCount(1);
  });

  test('shows the available calculations', async () => {
    await focusOnBody(page);
    await createCalculationBlockBelow(page, 'Hello = 5 + 1');
    await createCalculationBlockBelow(page, 'World = 5 + 3');

    await page.getByTestId('result-widget').click();

    await expect(
      page.locator('[aria-roledescription="dropdownOption"]').getByText('Hello')
    ).toBeVisible();
    await expect(
      page.locator('[aria-roledescription="dropdownOption"]').getByText('World')
    ).toBeVisible();
  });

  test('shows the result of a calculation', async () => {
    await page
      .locator('[aria-roledescription="dropdownOption"]')
      .getByText('Hello')
      .click();

    await expect(
      page.getByTestId('result-widget').getByText('6')
    ).toBeVisible();
  });

  test('updates the result when calculation changes', async () => {
    await page.getByText('Hello = 5 + 1').click();
    await page.keyboard.press('End');
    await page.keyboard.type(' + 4');

    await expect(
      page.getByTestId('result-widget').getByText('10')
    ).toBeVisible();
  });

  test('doesnt show tables nor formulas on widget dropdown', async () => {
    await createCalculationBlockBelow(page, 'table = { hello = [1, 2, 3] }');
    await createCalculationBlockBelow(page, 'f(x) = x + 10');

    await page.getByTestId('result-widget').click();
    // only one different variable available
    await expect(
      page.locator('[aria-roledescription="dropdownOption"]')
    ).toHaveCount(2);
  });
});
