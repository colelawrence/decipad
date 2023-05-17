import { BrowserContext, Page, test, expect } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import {
  createNumberInputBelow,
  createCodeLineV2Below,
  createCalculationBlockBelow,
  createDataViewBelow,
  createPieChartBelow,
  createLineChartBelow,
  createBarChartBelow,
  createAreaChartBelow,
  createScatterChartBelow,
  createInputBelow,
  createToggleBelow,
  createSliderBelow,
  createResultBelow,
  createDropdownBelow,
} from '../utils/page/Block';

import { createTable } from '../utils/page/Table';

test.describe('Test Menu Blocks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

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
    await page.getByText('Table1', { exact: true }).dblclick();
    await page.keyboard.type('FourthBlock');
    await expect(page.getByText('FourthBlock')).toBeVisible();
  });

  test('creates data view', async () => {
    await createDataViewBelow(page, 'FifthBlock');
  });

  test('creates pie chart', async () => {
    await createPieChartBelow(page, 'SixthBlock');
  });

  test('creates line chart', async () => {
    await createLineChartBelow(page, 'SeventhBlock');
  });

  test('creates bar chart', async () => {
    await createBarChartBelow(page, 'EightBlock');
  });

  test('creates area chart', async () => {
    await createAreaChartBelow(page, 'NinethBlock');
  });

  test('creates scatter chart', async () => {
    await createScatterChartBelow(page, 'TenthBlock');
  });

  test('creates input widget', async () => {
    await createInputBelow(page, 'EleventhBlock', '$200');
  });

  test('creates toggle widget', async () => {
    await createToggleBelow(page, 'TwelvethBlock');
  });

  test('creates date widget', async () => {
    await createDataViewBelow(page, 'ThirteenthBlock');
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

  // missing text blocks
});
