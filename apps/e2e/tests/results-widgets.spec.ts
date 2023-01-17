import { expect, Page, test } from '@playwright/test';
import { createCalculationBlockBelow } from '../utils/page/Block';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { Timeouts } from '../utils/src';

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

    await expect(page.locator('text=Result: Name')).toHaveCount(1);
  });

  test('shows the available calculations', async () => {
    await focusOnBody(page);
    await createCalculationBlockBelow(page, 'Hello = 5 + 1');
    await createCalculationBlockBelow(page, 'World = 5 + 3');

    await page.locator('[data-testid="result-widget"]').click();

    await expect(
      page.locator('button >> span + div:has-text("Hello")')
    ).toBeVisible();
    await expect(
      page.locator('button >> span + div:has-text("World")')
    ).toBeVisible();
  });

  test('shows the result of a calculation', async () => {
    await page.locator('button >> span + div:has-text("hello")').click();

    await expect(
      page.locator('[data-testid="result-widget"]:has-text("6")')
    ).toBeVisible();
  });

  test('updates the result when calculation changes', async () => {
    await page.locator('text=Hello = 5 + 1').click();
    await keyPress(page, 'End');
    await page.keyboard.type(' + 4');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);

    await expect(
      page.locator('[data-testid="result-widget"]:has-text("10")')
    ).toBeVisible();
  });

  test('doesnt show tables nor formulas on widget dropdown', async () => {
    await createCalculationBlockBelow(page, 'table = { hello = [1, 2, 3] }');
    await createCalculationBlockBelow(page, 'f(x) = x + 10');

    await page.locator('[data-testid="result-widget"]').click();
    // only one different variable available
    await expect(
      page.locator('button >> span + div >> visible=true')
    ).toHaveCount(3);
  });
});
