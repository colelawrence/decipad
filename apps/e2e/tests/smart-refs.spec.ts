import { expect, Page, test } from '@playwright/test';
import { createCalculationBlockBelow } from '../utils/page/Block';
import {
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';
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
    const smartRef = await page.waitForSelector(
      'span[data-slate-node="element"]'
    );
    const text = await smartRef.textContent();
    expect(cleanText(text)).toBe('var');
  });

  test('does not replace variable name with smart ref if selected', async () => {
    const srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(1); // from previous test
    await createCalculationBlockBelow(page, 'y = var');
    const newSrCount = (await page.$$('span[data-slate-node="element"]'))
      .length;
    expect(newSrCount).toBe(1); // no new smart refs
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

    await page.waitForSelector('span[data-slate-node="element"] >> nth=1');

    const srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(2);
  });

  test('no highlight in column declarations in code tables', async () => {
    const srCount = (await page.$$('code [data-state="closed"]')).length; // var decorations
    expect(srCount).toBe(11);
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
    let srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(0);

    await createCalculationBlockBelow(page, 'var = 10');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow(page, 'x = var ');
    srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(1);

    await keyPress(page, 'Backspace'); // space
    await keyPress(page, 'Backspace'); // select smart ref
    srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(1);

    await keyPress(page, 'Backspace'); // delete smart ref
    srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(0);
  });

  test('selects, then deletes smart ref on Delete', async () => {
    const srCount = (await page.$$('span[data-slate-node="element"]')).length;

    await createCalculationBlockBelow(page, 'var2 = 10');
    await keyPress(page, 'Enter');
    await createCalculationBlockBelow(page, 'var2 ');
    let newSrCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(newSrCount).toBe(srCount + 1);

    await keyPress(page, 'ArrowUp');
    await keyPress(page, 'ArrowRight'); // we're now at the start of the line
    await keyPress(page, 'Delete'); // select smart ref

    newSrCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(newSrCount).toBe(srCount + 1); // did not delete

    await keyPress(page, 'Delete'); // delete smart ref
    newSrCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(newSrCount).toBe(srCount);
  });
});
