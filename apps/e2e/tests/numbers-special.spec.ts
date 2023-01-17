import { expect, Page, test } from '@playwright/test';
import { getResult } from '../utils/page/Block';
import {
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';

const findMagicNumber = (page: Page) =>
  page.waitForSelector(`[data-testid=magic-number]`);

const findPotentialFormula = (page: Page) =>
  page.waitForSelector(`[data-testid=potential-formula]`);

const getHighlightContent = async (page: Page) => {
  const content = await (await findPotentialFormula(page)).textContent();
  return content?.replace(/\u2060/gi, '');
};

const getMagicNumberContent = async (page: Page) => {
  const content = await (await findMagicNumber(page)).textContent();
  // TODO: we don't use zero-width spaces in magic numbers, so we can remove this
  return content?.replace(/\u2060/gi, '');
};

test.describe('Formula highlighting', () => {
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

  const lineNo = -1;

  test('highlights a number while typing', async () => {
    await keyPress(page, 'Enter');
    await page.keyboard.type('We have bought 3');
    const potentialFormula = await getHighlightContent(page);
    expect(potentialFormula).toEqual('3');
  });

  test('editable when TAB pressed', async () => {
    await keyPress(page, 'Tab');
    await page.keyboard.type('+1');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    const potentialFormula = await getMagicNumberContent(page);
    expect(potentialFormula).toEqual('4');
  });

  test('you can continue typing after pressing ENTER', async () => {
    await keyPress(page, 'Enter');
    await page.keyboard.type('tickets to Paris.');
    const potentialFormula = await getMagicNumberContent(page);
    expect(potentialFormula).toEqual('4');
  });

  test('result could be dragged out', async () => {
    await keyPress(page, 'ArrowDown');
    await keyPress(page, 'ArrowDown');
    await keyPress(page, 'ArrowDown');

    const selector = '[data-type="paragraph"]:last-child';
    const lastParagraphNode = page.locator(selector);

    const resultEl = await getResult(page, lineNo);
    resultEl.dragTo(lastParagraphNode);

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(10000);
  });

  test('second instance editable by click', async () => {
    await page
      .getByTestId('paragraph-content')
      .nth(1)
      .getByTestId('magic-number')
      .click();

    await page.keyboard.type('+1');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(500);
    const potentialFormula = await getMagicNumberContent(page);
    expect(potentialFormula).toEqual('5');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(10000);
  });
});
