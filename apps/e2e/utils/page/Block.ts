import { Locator, Page } from 'playwright';
import { cleanText, Timeouts } from '../src';
import { keyPress } from './Editor';

export async function createInputBelow(
  page: Page,
  identifier: string,
  value: number | string
) {
  await page.click('[data-slate-editor] p >> nth=-1');

  await page.keyboard.insertText('/input');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.click('[data-testid="menu-item-input"]');

  await (await page.waitForSelector('text=/Input[0-9]+/ >> nth=-1')).dblclick();
  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);

  await page.click('div [data-testid="input-widget-name"]');
  await keyPress(page, 'ArrowDown');
  await keyPress(page, 'ArrowDown');
  // erase 100$, then focus goes to title, we come back down
  await keyPress(page, 'End');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');

  await page.keyboard.type(value.toString());
}

export async function createToggleBelow(page: Page, identifier: string) {
  await page.click('[data-slate-editor] p >> nth=-1');

  await page.keyboard.insertText('/toggle');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'toggle' }).click();

  await (await page.waitForSelector('text=/Input[0-9]+/ >> nth=-1')).dblclick();
  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createDateBelow(page: Page, identifier: string) {
  await page.click('[data-slate-editor] p >> nth=-1');

  await page.keyboard.insertText('/date');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'date' }).click();

  await (await page.waitForSelector('text=/Input[0-9]+/ >> nth=-1')).dblclick();
  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createCalculationBlockBelow(
  page: Page,
  decilang: string
) {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);
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

export async function createCodeLineV2Below(
  page: Page,
  variableName: string,
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

  await page.waitForSelector(
    '[data-slate-editor] [data-testid="codeline-varname"]'
  );

  // Click the varname (we default to the code itself)
  await page.dblclick(
    '[data-slate-editor] [data-testid="codeline-varname"] >> nth=-1'
  );

  await page.keyboard.type(variableName);

  await page.keyboard.press('ArrowRight');

  await page.keyboard.type(decilang);

  await page.waitForSelector('[data-slate-editor] code >> nth=-1');
}

export async function createStructuredInputBelow(
  page: Page,
  variableName: string,
  value: string
) {
  await page.click('[data-slate-editor] p >> nth=-1');

  await page
    .locator('p:has-text("Type / for new blocks = to start calculation")')
    .click();

  await page.keyboard.type('/structured');
  await page.locator('[data-testid="menu-item-structured_in"]').click();
  await page.dblclick(
    '[data-slate-editor] [data-testid="codeline-varname"] >> nth=-1'
  );
  await page.keyboard.type(variableName);
  await page.keyboard.press('ArrowRight');
  await page.dblclick(
    '[data-slate-editor] [data-testid="structured-input-value"] >> nth=-1'
  );
  await page.keyboard.type(value);
}

export function getCodeLineBlockLocator(page: Page) {
  return page.locator('//*[@data-slate-editor][//code]') as Locator;
}

export function getCodeLines(page: Page) {
  return getCodeLineBlockLocator(page).locator('code');
}

export function getCodeV2VarNames(page: Page) {
  return getCodeLineBlockLocator(page).locator(
    '[data-testid=codeline-varname]'
  );
}

export function getCodeV2CodeContainers(page: Page) {
  return getCodeLineBlockLocator(page).locator('[data-testid=codeline-code]');
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

export function getCodeLineV2VarName(page: Page, n: number) {
  return getCodeV2VarNames(page).nth(n);
}

export async function getResult(page: Page, n: number) {
  const locator = getResults(page).nth(n);

  await locator.waitFor();

  return locator;
}
