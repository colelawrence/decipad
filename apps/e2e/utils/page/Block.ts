import { Locator, Page } from 'playwright';
import { cleanText } from '../src';
import { keyPress } from './Editor';

export async function createInputBelow(
  page: Page,
  identifier: string,
  value: number
) {
  await page.click('[data-slate-editor] p >> nth=-1');

  await page.keyboard.insertText('/input');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.click('text=InputInputA value that others can interact with');

  await page.locator('text=/Input[0-9]+/ >> nth=-1').dblclick();
  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);

  await page.click('div [data-testid="input-widget-name"]');
  await keyPress(page, 'ArrowDown');
  // erase 100$, then focus goes to title, we come back down
  await keyPress(page, 'End');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');

  await page.keyboard.type(value.toString());
}

export async function createCalculationBlockBelow(
  page: Page,
  decilang: string
) {
  await page.click('[data-slate-editor] p >> nth=-1');

  await page.waitForSelector(
    'p:has-text("Type / for new blocks = to start calculation")'
  );
  await page.click(
    'p:has-text("Type / for new blocks = to start calculation")'
  );

  await keyPress(page, '=');

  await page.waitForSelector('[data-slate-editor] code');

  await page.keyboard.type(decilang);

  await page.waitForSelector('[data-slate-editor] code >> nth=-1');
}

export function getCodeLineBlockLocator(page: Page) {
  return page.locator('//*[@data-slate-editor][//code]') as Locator;
}

export function getCodeLines(page: Page) {
  return getCodeLineBlockLocator(page).locator('code');
}

export function getResults(page: Page) {
  return getCodeLineBlockLocator(page).locator('output');
}

export async function getCodeLineContent(page: Page, n: number) {
  const lineContent = (
    await getCodeLines(page).nth(n).allTextContents()
  ).join();
  return cleanText(lineContent);
}

export async function getResult(page: Page, n: number) {
  const locator = getResults(page).nth(n);

  await locator.waitFor();

  return locator;
}
