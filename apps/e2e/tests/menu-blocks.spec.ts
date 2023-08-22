import { BrowserContext, Page, expect, test } from '@playwright/test';
import {
  createAreaChartBelow,
  createBarChartBelow,
  createCalculationBlockBelow,
  createCodeLineV2Below,
  createDataViewBelow,
  createDateBelow,
  createDropdownBelow,
  createInputBelow,
  createLineChartBelow,
  createNumberInputBelow,
  createPieChartBelow,
  createResultBelow,
  createScatterChartBelow,
  createSliderBelow,
  createToggleBelow,
} from '../utils/page/Block';
import { focusOnBody, setUp } from '../utils/page/Editor';

import { createTable } from '../utils/page/Table';

test.describe('Test Menu Blocks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('focus on notebook', async () => {
    await focusOnBody(page);
  });

  test('creates number input', async () => {
    await createNumberInputBelow(page, 'FirstBlock', '$200');
  });

  test('creates formula', async () => {
    await createCodeLineV2Below(page, 'SecondBlock', '1 + 1');
  });

  test('creates advanced formula', async () => {
    await createCalculationBlockBelow(page, 'ThirdBlock = 68 + 1');
  });

  test('creates table', async () => {
    await createTable(page);
    await page.getByTestId('table-name-input').dblclick();
    await page.keyboard.type('FourthBlock');
    await expect(page.getByText('FourthBlock')).toBeVisible();
  });

  test('creates pie chart', async () => {
    await createPieChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  test('creates line chart', async () => {
    await createLineChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  test('creates bar chart', async () => {
    await createBarChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  test('creates area chart', async () => {
    await createAreaChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  test('creates scatter chart', async () => {
    await createScatterChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  test('creates input widget', async () => {
    await createInputBelow(page, 'EleventhBlock', '$200');
  });

  test('creates toggle widget', async () => {
    await createToggleBelow(page, 'TwelvethBlock');
  });

  test('creates date widget', async () => {
    await createDateBelow(page, 'DateThing');
  });

  test('creates slider widget', async () => {
    await createSliderBelow(page, 'FourteenthBlock', '5');
  });

  test('creates result widget', async () => {
    await createResultBelow(page);
  });

  test('creates dropdown widget', async () => {
    await createDropdownBelow(page, 'SixteenthBlock');
  });

  test('creates data view', async () => {
    await createDataViewBelow(page);
  });

  // missing text blocks
});
