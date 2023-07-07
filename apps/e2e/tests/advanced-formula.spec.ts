import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  createCalculationBlockBelow,
  getCodeLineContent,
} from '../utils/page/Block';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { getCaretPosition } from '../utils/src';

test.describe('Calculation Blocks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  let lineNo = 0;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Calculates 1 + 1', async () => {
    await createCalculationBlockBelow(page, '1 + 1');
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:2')
    ).toBeVisible();
  });

  test('Enter does a soft break inside parentesis', async () => {
    const lineText = '(10 + 2)';
    await page.keyboard.press('ArrowDown');
    await createCalculationBlockBelow(page, lineText);
    lineNo += 1;

    const lineBefore = await getCodeLineContent(page, lineNo);
    expect(lineBefore).toBe(lineText);

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');

    const [left, right] = [lineText.slice(0, -2), lineText.slice(-2)];
    const brokenLine = `${left}\n${right}`;
    const lineAfter = await getCodeLineContent(page, lineNo);
    expect(lineAfter).toBe(brokenLine);
  });

  test('Enter moves caret to the end', async () => {
    const lineText = '3 + 7';
    await page.keyboard.press('ArrowDown');
    await createCalculationBlockBelow(page, lineText);
    lineNo += 1;

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    const caretBefore = await getCaretPosition(page);

    await page.keyboard.press('Enter');

    const caretAfter = await getCaretPosition(page);
    expect(caretBefore).toBeDefined();
    expect(caretAfter).toBe(caretBefore! + 2);
  });

  test('Shift+Enter moves caret to a new code line below', async () => {
    const lineText = 'a = 10';
    await page.keyboard.press('ArrowDown');
    await createCalculationBlockBelow(page, lineText);
    lineNo += 1;

    await page.keyboard.press('Shift+Enter');
    lineNo += 1;

    await expect(page.getByTestId('code-line')).toHaveCount(lineNo + 1);
  });
});
