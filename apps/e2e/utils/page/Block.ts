import { Locator, Page } from 'playwright';
import { cleanText, Timeouts } from '../src';
import { keyPress, ControlPlus } from './Editor';

export async function createNumberInputBelow(
  page: Page,
  identifier: string,
  value: string
) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/number');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'number input' }).click();

  await page.dblclick(
    '[data-slate-editor] [data-testid="codeline-varname"] >> nth=-1'
  );

  await page.keyboard.type(identifier);

  await page.keyboard.press('ArrowRight');

  await ControlPlus(page, 'a');

  await page.keyboard.type(value);

  await page.waitForSelector('[data-slate-editor] code >> nth=-1');
}

export async function createInputBelow(
  page: Page,
  identifier: string,
  value: number | string
) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/input');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.click('[data-testid="menu-item-input"]');

  await page
    .locator('[data-testid="widget-caption"] >> text=/Input[0-9]+/')
    .last()
    .dblclick();

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

export async function createDropdownBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/dropdown');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'dropdown' }).click();

  await page.getByText('Dropdown1', { exact: true }).last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createResultBelow(page: Page) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/result');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'result' }).click();

  await page
    .locator('[data-testid="widget-caption"] >> text=/Unnammed/')
    .last();
}

export async function createDataViewBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/data view');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'data' }).click();

  await page.getByText('Data view').last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createPieChartBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/pie chart');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'chart' }).click();

  await page.getByPlaceholder('Chart title').last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createLineChartBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/line chart');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'chart' }).click();

  await page.getByPlaceholder('Chart title').last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createBarChartBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/bar chart');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'chart' }).click();

  await page.getByPlaceholder('Chart title').last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createAreaChartBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/area chart');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'chart' }).click();

  await page.getByPlaceholder('Chart title').last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createScatterChartBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/scatter plot');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'plot' }).click();

  await page.getByPlaceholder('Chart title').last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createToggleBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/toggle');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'toggle' }).click();

  await page
    .locator('[data-testid="widget-caption"] >> text=/Input[0-9]+/')
    .last()
    .dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createSliderBelow(
  page: Page,
  identifier: string,
  value: number | string
) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/slider');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'slider' }).click();

  await page
    .locator('[data-testid="widget-caption"] >> text=/Slider[0-9]+/')
    .last()
    .dblclick();

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

export async function createDateBelow(page: Page, identifier: string) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/date');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page.locator('role=menuitem', { hasText: 'date' }).click();

  await page
    .locator('[data-testid="widget-caption"] >> text=/Input[0-9]+/')
    .last()
    .dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createCalculationBlockBelow(
  page: Page,
  decilang: string
) {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.waitForSelector(
    '[data-testid="paragraph-wrapper"]:has-text("Type / for new blocks or = for an input")'
  );
  await page.click(
    '[data-testid="paragraph-wrapper"]:has-text("Type / for new blocks or = for an input")'
  );

  await page.keyboard.insertText('/advanced');

  await page.locator('role=menuitem', { hasText: 'Advanced' }).click();

  await page.waitForSelector('[data-testid="code-line"]');

  await page.keyboard.type(decilang);

  await page.waitForSelector('[data-testid="code-line"] >> nth=-1');

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.computerDelay);
}

export async function createCodeLineV2Below(
  page: Page,
  variableName: string,
  decilang: string
) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.waitForSelector(
    '[data-testid="paragraph-wrapper"]:has-text("Type / for new blocks or = for an input")'
  );
  await page.click(
    '[data-testid="paragraph-wrapper"]:has-text("Type / for new blocks or = for an input")'
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

  await ControlPlus(page, 'a');

  await page.keyboard.type(decilang);

  await page.waitForSelector('[data-slate-editor] code >> nth=-1');
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
