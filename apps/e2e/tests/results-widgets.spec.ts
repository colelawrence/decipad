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
    await page.locator('button >> span >> svg').click();

    const result = page.locator('text=Result: Name');

    expect(await result.count()).toBe(1);
  });

  test('shows the available calculations', async () => {
    await focusOnBody(page);
    await createCalculationBlockBelow(page, 'Hello = 5 + 1');
    await createCalculationBlockBelow(page, 'World = 5 + 3');

    await page.locator('[data-testid="result-widget"]').click();

    await page.waitForSelector('button >> span + div:has-text("Hello")');
    await page.waitForSelector('button >> span + div:has-text("World")');
  });

  test('shows the result of a calculation', async () => {
    await page.locator('button >> span + div:has-text("hello")').click();

    await page.waitForSelector('[data-testid="result-widget"]:has-text("6")');
  });

  test('updates the result when calculation changes', async () => {
    await page.locator('text=Hello = 5 + 1').click();
    await keyPress(page, 'End');
    await page.keyboard.type(' + 4');
    await page.waitForTimeout(Timeouts.typing);

    await page.waitForSelector('[data-testid="result-widget"]:has-text("10")');
  });

  test('doesnt show tables nor formulas on widget dropdown', async () => {
    await createCalculationBlockBelow(page, 'table = { hello = [1, 2, 3] }');
    await createCalculationBlockBelow(page, 'f(x) = x + 10');

    await page.locator('[data-testid="result-widget"]').click();
    await page.waitForSelector('button >> span + div >> visible=true');
    const count = await page
      .locator('button >> span + div >> visible=true')
      .count();

    // only one different variable available
    expect(count).toBe(2);
  });
});
