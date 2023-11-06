import { expect, Locator, Page } from '@playwright/test';
import { Timeouts, cleanText } from '../src';
import { ControlPlus, keyPress } from './Editor';

export async function createWithSlashCommand(
  page: Page,
  command: string,
  // For disambiguation
  menuItem?: string
) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);

  await page.keyboard.insertText(command);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);

  if (menuItem) {
    await page.click(`[data-testid="menu-item-${menuItem}"]`);
  } else {
    await page.keyboard.press('Enter');
  }
}

export async function createNumberInputBelow(
  page: Page,
  identifier: string,
  value: string
) {
  await createWithSlashCommand(page, '/number');

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
  await createWithSlashCommand(page, '/input', 'input');

  await page
    .locator('[data-testid="widget-caption"] >> text=/Input/')
    .last()
    .dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);

  await page.click('div [data-testid="input-widget-name"] >> nth=-1');
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
  await createWithSlashCommand(page, '/dropdown');

  await page.getByText('Dropdown', { exact: true }).last().dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
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

export async function createToggleBelow(page: Page, identifier: string) {
  await createWithSlashCommand(page, '/toggle');

  await page
    .locator('[data-testid="widget-caption"] >> text=/Input/')
    .last()
    .dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
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

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);

  await page.click('div [data-testid="input-widget-name"] >> nth=-1');
  await keyPress(page, 'ArrowDown');
  // erase 100$, then focus goes to title, we come back down
  await keyPress(page, 'End');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');
  await keyPress(page, 'Backspace');

  await page.keyboard.type(value.toString());

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

    page.keyboard.press('Escape');
  }
}

export async function createDateBelow(page: Page, identifier: string) {
  await createWithSlashCommand(page, '/date');

  await page
    .locator('[data-testid="widget-caption"] >> text=/Input/')
    .last()
    .dblclick();

  await keyPress(page, 'Backspace');

  await page.keyboard.type(identifier);
}

export async function createCalculationBlockBelow(
  page: Page,
  decilang: string
) {
  const checkIncremented = await page.getByTestId('code-line').count();
  await createWithSlashCommand(page, '/advanced');
  await expect(async () => {
    await expect(await page.getByTestId('code-line').count()).toBe(
      checkIncremented + 1
    );
  }).toPass();

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

  // Select the varname (we default to the code itself)
  await page.click(
    '[data-slate-editor] [data-testid="codeline-varname"] >> nth=-1'
  );

  await ControlPlus(page, 'a');

  await page.keyboard.type(variableName);

  await page.keyboard.press('ArrowRight');

  await ControlPlus(page, 'a');

  await page.keyboard.type(decilang);

  await page.waitForSelector('[data-slate-editor] code >> nth=-1');
}

export async function createCSVBelow(page: Page) {
  await createWithSlashCommand(page, '/csv', 'upload-csv');
}

export async function createEmbedBelow(page: Page) {
  await page.click('[data-testid="paragraph-wrapper"] >> nth=-1');

  await page.keyboard.insertText('/embed');

  await page.waitForSelector('[data-slate-editor] [role="menuitem"]');

  await page
    .locator('article')
    .getByRole('menuitem')
    .getByText('embed')
    .nth(0)
    .click();
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

export async function selectBlocks(
  page: Page,
  startBlock: number,
  endBlock: number
) {
  const [startBoxLocation, endBoxLocation] = await Promise.all([
    page
      .locator(`[data-testid="drag-handle"] >> nth=${startBlock}`)
      .boundingBox(),
    page
      .locator(`[data-testid="drag-handle"] >> nth=${endBlock}`)
      .boundingBox(),
  ]);

  const width = page.viewportSize()?.width;
  const startMousePosition = {
    x: startBoxLocation!.x / 2,
    y: startBoxLocation!.y,
  };

  const endMouseLocation = {
    x: endBoxLocation!.x + width! / 2,
    y: endBoxLocation!.y,
  };

  await page.mouse.move(startMousePosition.x, startMousePosition.y);
  await page.mouse.down();
  await page.mouse.move(endMouseLocation.x, endMouseLocation.y);
  await page.mouse.up();
}
