import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { createStructuredInputBelow } from '../utils/page/Block';
import { Timeouts } from '../utils/src';

test.describe('Structured Inputs', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await setUp(
      { page, context },
      {
        showChecklist: false,
      }
    );
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Creates a structured input', async () => {
    await createStructuredInputBelow(page, 'Salary', '60000');
    await expect(page.locator('text="Salary"')).toBeVisible();
    await expect(page.locator('text="60000"')).toBeVisible();
  });

  test('Rename the variable', async () => {
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    await page.dblclick(
      '[data-slate-editor] [data-testid="codeline-varname"] >> nth=-1'
    );
    await page.keyboard.type('AnotherName');
    await expect(page.locator('text="AnotherName"')).toBeVisible();
  });

  test('Create another structured input', async () => {
    await page.keyboard.down('Shift');
    await page.keyboard.press('Enter');

    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    await page.keyboard.type('SecondName');

    await expect(
      page.locator('[data-slate-editor] [data-testid="codeline-varname"]')
    ).toHaveCount(2);
  });

  test('Changes the value of the 2nd one using keyboard shortcuts', async () => {
    await page.keyboard.press('Tab');
    await page.keyboard.type('123');
    await expect(page.locator('text="123"')).toBeVisible();
  });

  test('Expect the results to show up on the editor (using a result widget)', async () => {
    await page.locator('[data-slate-editor] p >> nth=-1').click();
    await page.keyboard.type('/result');
    await page.locator('[data-testid="menu-item-display"]').click();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.locator('[data-testid="result-widget"]').click();
    await page.locator('[role="menuitem"]:has-text("AnotherName")').click();

    await page.waitForSelector(
      '[data-testid="result-widget"]:has-text("60 thousand")'
    );

    await expect(
      page.locator('[data-testid="result-widget"]:has-text("60 thousand")')
    ).toBeVisible();

    await page.locator('[data-testid="result-widget"]').click();
    await page.waitForSelector('[role="menuitem"]:has-text("SecondName")');
    await page.locator('[role="menuitem"]:has-text("SecondName")').click();

    await expect(
      page.locator('[data-testid="result-widget"]:has-text("123")')
    ).toBeVisible();
  });
});
