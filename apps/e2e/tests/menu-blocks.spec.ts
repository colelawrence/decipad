import { expect, test } from './manager/decipad-tests';
import {
  createAreaChartBelow,
  createBarChartBelow,
  createDataViewBelow,
  createDateBelow,
  createLineChartBelow,
  createPieChartBelow,
  createResultBelow,
  createScatterChartBelow,
  createSliderBelow,
} from '../utils/page/Block';

import { createTable } from '../utils/page/Table';

test('check menu blocks', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('focus on notebook', async () => {
    await notebook.focusOnBody();
  });

  await test.step('creates date widget', async () => {
    await createDateBelow(page, 'DateThing');
  });

  await test.step('creates number input', async () => {
    await notebook.addFormula('FirstBlock', '$200');
  });

  await test.step('creates formula', async () => {
    await testUser.notebook.addFormula('SecondBlock', '1+1');
  });

  await test.step('creates advanced formula', async () => {
    await notebook.addAdvancedFormula('ThirdBlock = 68 + 1');
  });

  await test.step('creates table', async () => {
    await createTable(page);
    await page.getByTestId('table-name-input').dblclick();
    await page.keyboard.type('FourthBlock');
    await expect(page.getByText('FourthBlock')).toBeVisible();
  });

  await test.step('creates pie chart', async () => {
    await createPieChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  await test.step('creates line chart', async () => {
    await createLineChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  await test.step('creates bar chart', async () => {
    await createBarChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  await test.step('creates area chart', async () => {
    await createAreaChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  await test.step('creates scatter chart', async () => {
    await createScatterChartBelow(page);
    expect(await page.getByTestId('error-block').count(), `broken blocks`).toBe(
      0
    );
  });

  await test.step('creates input widget', async () => {
    await notebook.addInputWidget('EleventhBlock', '$200');
  });

  await test.step('creates toggle widget', async () => {
    await notebook.addToggleWidget('TwelvethBlock');
  });

  await test.step('creates slider widget', async () => {
    await createSliderBelow(page, 'FourteenthBlock', '5');
  });

  await test.step('creates result widget', async () => {
    await createResultBelow(page);
  });

  await test.step('creates dropdown widget', async () => {
    await notebook.addDropdownWidget('SixteenthBlock');
  });

  await test.step('creates data view', async () => {
    await createDataViewBelow(page);
  });

  // missing text blocks
});
