import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  createCalculationBlockBelow,
  getCodeLineContent,
  getResult,
} from '../utils/page/Block';
import { keyPress, setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { getCaretPosition } from '../utils/src';

test.describe('Calculation Blocks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  let lineNo = -1;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Calculates 1 + 1', async () => {
    const lineText = '1 + 1';
    await keyPress(page, 'ArrowDown');
    await createCalculationBlockBelow(page, lineText);

    lineNo += 1;

    const line = await getCodeLineContent(page, lineNo);
    expect(line).toBe(lineText);

    const result = await getResult(page, lineNo);
    expect(await result.allTextContents()).toMatchObject([
      expect.stringMatching(/2/i),
    ]);
  });

  test('Enter does a soft break inside parentesis', async () => {
    const lineText = '(10 + 2)';
    await keyPress(page, 'ArrowDown');
    await createCalculationBlockBelow(page, lineText);

    lineNo += 1;

    const lineBefore = await getCodeLineContent(page, lineNo);
    expect(lineBefore).toBe(lineText);

    await keyPress(page, 'ArrowLeft');
    await keyPress(page, 'ArrowLeft');
    await keyPress(page, 'Enter');

    const [left, right] = [lineText.slice(0, -2), lineText.slice(-2)];
    const brokenLine = `${left}\n${right}`;
    const lineAfter = await getCodeLineContent(page, lineNo);
    expect(lineAfter).toBe(brokenLine);
  });

  test('Enter moves caret to the end', async () => {
    const lineText = '3 + 7';
    await keyPress(page, 'ArrowDown');
    await createCalculationBlockBelow(page, lineText);

    lineNo += 1;

    await keyPress(page, 'ArrowLeft');
    await keyPress(page, 'ArrowLeft');
    const caretBefore = await getCaretPosition(page);

    await keyPress(page, 'Enter');

    const caretAfter = await getCaretPosition(page);
    expect(caretBefore).toBeDefined();
    expect(caretAfter).toBe(caretBefore! + 2);
  });

  test('Shift+Enter moves caret to a new code line below', async () => {
    const lineText = 'a = 10';
    await keyPress(page, 'ArrowDown');
    await createCalculationBlockBelow(page, lineText);

    lineNo += 1;

    const clCount = (await page.locator('code').all()).length;

    await keyPress(page, 'Shift+Enter');
    lineNo += 1;

    await expect(page.locator('code')).toHaveCount(clCount + 1);
  });
});
