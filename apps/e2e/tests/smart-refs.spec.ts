import { expect, Page, test } from '@playwright/test';
import { createCalculationBlockBelow } from '../utils/page/Block';
import {
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { createTable } from '../utils/page/Table';
import { cleanText } from '../utils/src';

test.describe('SmartRefs simple case', () => {
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

  test('replaces variable name with smart ref', async () => {
    await createCalculationBlockBelow(page, 'var = 10');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow(page, 'x = var ');
    await expect(page.locator('span[data-slate-node="element"]')).toContainText(
      'var'
    );
  });

  test('does not replace variable name with smart ref if selected', async () => {
    await createCalculationBlockBelow(page, 'y = var');
    // no new smart refs
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );
  });
});

test.describe('SmartRefs in low code tables', () => {
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

  test('replaces low code table column name with smart ref', async () => {
    await page.keyboard.press('Enter');
    await createTable(page);
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow(page, 'x = Table1.Property1');
    await page.keyboard.press('Enter');
    const text = await page
      .locator('span[data-slate-node="element"]')
      .textContent();
    expect(cleanText(text)).toBe('Table1.Property1');
  });
});

test.describe('SmartRefs in code tables', () => {
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

  test('no infinite loops on code table column declaration', async () => {
    await createCalculationBlockBelow(page, 'A = 5');
    await page.keyboard.press('Enter');

    await createCalculationBlockBelow(page, 'Tab = {Col1 = A, Col2 = A}');
    await page.keyboard.press('Enter');

    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      2
    );
  });

  test('no highlight in column declarations in code tables', async () => {
    // var decorations
    await expect(page.locator('code [data-state="closed"]')).toHaveCount(11);
  });
});

test.describe('Deleting SmartRefs', () => {
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

  test('selects, then deletes smart ref on Backspace', async () => {
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      0
    );

    await createCalculationBlockBelow(page, 'var = 10');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow(page, 'x = var ');
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );

    await keyPress(page, 'Backspace'); // space
    await keyPress(page, 'Backspace'); // select smart ref
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );

    await keyPress(page, 'Backspace'); // delete smart ref
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      0
    );
  });

  test('selects, then deletes smart ref on Delete', async () => {
    await createCalculationBlockBelow(page, 'var2 = 10');
    await keyPress(page, 'Enter');
    await createCalculationBlockBelow(page, 'var2 ');
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );

    await keyPress(page, 'ArrowUp');
    await keyPress(page, 'ArrowRight'); // we're now at the start of the line
    await keyPress(page, 'Delete'); // select smart ref

    // did not delete
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );

    await keyPress(page, 'Backspace');
    await keyPress(page, 'Backspace');
    // delete smart ref
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      0
    );
  });
});
