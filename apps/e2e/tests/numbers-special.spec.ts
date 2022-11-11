import { expect, Page, test } from '@playwright/test';
import {
  createCalculationBlockBelow,
  getCodeLineContent,
  getResult,
} from '../utils/page/Block';
import {
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';

const findInlineNumber = (page: Page) =>
  page.waitForSelector(`[data-testid=inline-number-element]`);

const getInlineNumberContent = async (page: Page) => {
  const content = await (await findInlineNumber(page)).textContent();
  return content?.replace(/\u2060/gi, '');
};

test.describe('Inline numbers', () => {
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

  let lineNo = -1;

  test('creates a number while typing', async () => {
    await keyPress(page, 'Enter');
    await page.keyboard.type('We have bought 3');
    const inlineNumber = await getInlineNumberContent(page);
    expect(inlineNumber).toEqual('3');
  });

  test('jumps out on Enter key', async () => {
    await keyPress(page, 'Enter');
    await page.keyboard.type('tickets to Paris.');

    const inlineNumber = await getInlineNumberContent(page);
    expect(inlineNumber).toEqual('3');
  });

  test('opens a name field on click', async () => {
    // TODO: is there better way to focus?
    for (let i = 19; i > 0; i -= 1) {
      await page.keyboard.press('ArrowLeft');
    }
    const number = await findInlineNumber(page);
    await number.click();
    await keyPress(page, 'Tab');
    await keyPress(page, 'ArrowDown');
    await keyPress(page, 'ArrowLeft');
    await page.keyboard.type('cookies = ');
  });

  test('can be referenced by typing', async () => {
    await keyPress(page, 'ArrowDown');

    lineNo += 1;

    await createCalculationBlockBelow(page, '100 + cookies ');

    const line = await getCodeLineContent(page, lineNo);
    expect(line).toEqual('cookies = 3');

    const resultEl = await getResult(page, lineNo);
    const result = await resultEl.textContent();
    expect(result).toBe('3');
  });
});
