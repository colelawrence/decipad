/* eslint-disable jest/expect-expect */
import {
  createCalculationBlockBelow,
  getCodeLineContent,
  getResult,
} from './page-utils/Block';
import { keyPress, setUp, waitForEditorToLoad } from './page-utils/Pad';

const findInlineNumber = () =>
  page.waitForSelector(`[data-testid=inline-number-element]`);

const findInlineNumberNameInput = () =>
  page.waitForSelector(`[data-testid=tooltip-inline-number] input`);

const getInlineNumberContent = async () => {
  const content = await (await findInlineNumber()).textContent();
  return content?.replace(/\u2060/gi, '');
};

describe('notebook inline numbers', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  let lineNo = -1;

  it('creates a number while typing', async () => {
    await keyPress('Enter');
    await page.keyboard.type('We have bought 3');

    const inlineNumber = await getInlineNumberContent();
    expect(inlineNumber).toEqual('3');
  });

  it('jumps out on Enter key', async () => {
    await keyPress('Enter');
    await page.keyboard.type('tickets to Paris.');

    const inlineNumber = await getInlineNumberContent();
    expect(inlineNumber).toEqual('3');
  });

  it('opens a name field on click', async () => {
    // TODO: is there better way to focus?
    for (let i = 19; i > 0; i -= 1) {
      await page.keyboard.press('ArrowLeft');
    }
    const number = await findInlineNumber();
    await number.click();

    const input = await findInlineNumberNameInput();
    await input.type('cookies');
  });

  it('hides tooltip on enter', async () => {
    const input = await findInlineNumberNameInput();
    await keyPress('Enter');
    await input.waitForElementState('hidden');
  });

  it('can be referenced by clicking', async () => {
    await keyPress('ArrowDown');

    lineNo += 1;

    await createCalculationBlockBelow('100 +');

    const number = await findInlineNumber();
    await number.click();

    const line = await getCodeLineContent(lineNo);
    expect(line).toBe('100 + cookies ');

    const resultEl = await getResult(lineNo);
    const result = await resultEl.textContent();
    expect(result).toBe('103');
  });
});
