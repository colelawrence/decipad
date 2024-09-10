/* eslint-disable playwright/no-wait-for-selector */
import type { Locator, Page } from '@playwright/test';
import { Timeouts, cleanText } from '../src';

export async function focusTrailingParagraph(page: Page) {
  // Clicking once doesn't always work when running tests at full speed
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);
}

export async function createWithSlashCommand(
  page: Page,
  command: string,
  // For disambiguation
  menuItem?: string
) {
  await focusTrailingParagraph(page);

  await page.keyboard.insertText(command);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing + Timeouts.menuOpenDelay);

  if (menuItem) {
    await page.click(
      `[data-slate-editor] >> [data-testid="menu-item-${menuItem}"]`
    );
  } else {
    await page.keyboard.press('Enter');
  }
}

export async function createResultBelow(page: Page) {
  await createWithSlashCommand(page, '/result');

  page.locator('[data-testid="widget-caption"] >> text=/Unnammed/').last();
}

export async function createDataViewBelow(page: Page) {
  await createWithSlashCommand(page, '/data view');
}

export async function createPieChartBelow(page: Page) {
  await createWithSlashCommand(page, '/pie chart');
}

export async function createLineChartBelow(page: Page) {
  await createWithSlashCommand(page, '/line chart');
}

export async function createBarChartBelow(page: Page) {
  await createWithSlashCommand(page, '/bar chart');
}

export async function createAreaChartBelow(page: Page) {
  await createWithSlashCommand(page, '/area chart');
}

export async function createScatterChartBelow(page: Page) {
  await createWithSlashCommand(page, '/scatter chart');
}

export async function createSliderBelow(
  page: Page,
  identifier: string,
  value: number | string,
  options?: { min?: number; max?: number; step?: number }
) {
  await createWithSlashCommand(page, '/slider');

  await page
    .locator('[data-testid="widget-caption"] >> text=/Slider/')
    .last()
    .dblclick();

  await page.keyboard.press('Backspace');

  await page.keyboard.type(identifier);

  await page.click('div [data-testid="input-widget-name"] >> nth=-1');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.press('ArrowDown');
  // erase 100$, then focus goes to title, we come back down
  await page.keyboard.press('End');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');

  await page.keyboard.type(value.toString(), { delay: Timeouts.typing });

  if (options) {
    await page
      .locator('[data-testid="widget-editor"] button >> nth=-1')
      .click();

    if (options.min) {
      await page
        .locator('[role = "menu"] input >> nth=0')
        .fill(String(options.min));
    }

    if (options.max) {
      await page
        .locator('[role = "menu"] input >> nth=1')
        .fill(String(options.max));
    }

    if (options.step) {
      await page
        .locator('[role = "menu"] input >> nth=2')
        .fill(String(options.step));
    }

    await page.keyboard.press('Escape');
  }
}

export async function createDateBelow(page: Page, identifier: string) {
  await createWithSlashCommand(page, '/date');

  await page
    .locator('[data-testid="widget-caption"] >> text=/Input/')
    .last()
    .dblclick();

  await page.keyboard.press('Backspace');

  await page.keyboard.type(identifier);
}

export async function createEmbedBelow(page: Page) {
  await createWithSlashCommand(page, '/embed');
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
