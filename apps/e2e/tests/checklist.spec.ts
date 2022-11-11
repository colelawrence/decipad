import { expect, test } from '@playwright/test';
import { BrowserContext, Page } from 'playwright-core';
import { focusOnBody, setUp, waitForEditorToLoad } from '../utils/page/Editor';

test.describe('Starter list', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await setUp({ page, context }, { showChecklist: true });
    await waitForEditorToLoad(page, {
      showChecklist: true,
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('checks off the create calculation goal', async () => {
    await page.waitForSelector('text=👋 Welcome to Decipad!');
    await focusOnBody(page);
    // not using createCodeLineBelow() because this is most likely how the user
    // would create a calculation line.
    await page.keyboard.type('/');
    await page.locator('text=Calculations').click();

    await page.waitForSelector('text=Create your first calculation');
    const goal = await page
      .locator('text=Create your first calculation')
      .evaluate((e) =>
        window.getComputedStyle(e).getPropertyValue('text-decoration')
      );
    expect(/line-through/i.test(goal)).toBe(true);
  });

  test('gets the edit calculation goal', async () => {
    await page.keyboard.type('InMyPocket = TotalWinnings - 24%');

    await page.waitForSelector('text=Edit the calculation');
    const changeCalculationGoal = page.locator('text=Edit the calculation');

    // Race condition for the css to be applied properly.
    const goal = await changeCalculationGoal.evaluate((e) =>
      window.getComputedStyle(e).getPropertyValue('text-decoration')
    );

    expect(/line-through/i.test(goal)).toBeTruthy();
  });

  test('gets the edit calculation goal (edit an input widget)', async () => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('/input');
    await page.locator('svg:has(title:has-text("Input"))').click();

    await page.keyboard.type('100');

    await page.waitForSelector('text=Create your first input variable');
    const editVarGoal = page.locator('text=Create your first input variable');

    const goal = await editVarGoal.evaluate((e) =>
      window.getComputedStyle(e).getPropertyValue('text-decoration')
    );
    expect(/line-through/i.test(goal)).toBeTruthy();
  });
});
