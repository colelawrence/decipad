import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createTable, getFromTable, writeInTable } from '../utils/page/Table';
import { Timeouts } from '../utils/src';

test.describe('Charts', () => {
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

  test('creates table', async () => {
    await focusOnBody(page);
    await createTable(page);
  });

  test('fills table', async () => {
    // first column
    await writeInTable(page, 'Imports', 1, 0);
    expect(await getFromTable(page, 1, 0)).toBe('Imports');
    await writeInTable(page, 'Hydro, wind and solar', 2, 0);
    expect(await getFromTable(page, 2, 0)).toBe('Hydro, wind and solar');
    await writeInTable(page, 'Bioenergy', 3, 0);
    expect(await getFromTable(page, 3, 0)).toBe('Bioenergy');

    // second column
    await writeInTable(page, '0.68%', 1, 1);
    expect(await getFromTable(page, 1, 1)).toBe('0.68%');
    await writeInTable(page, '3.02%', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('3.02%');
    await writeInTable(page, '9.32%', 3, 1);
    expect(await getFromTable(page, 3, 1)).toBe('9.32%');
  });

  test('creates a pie chart', async () => {
    await page.locator('text=Create chart').click();
    await page.locator('[data-test-id="create-chart__arc"]').click();

    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight * 2)
    );
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(1000);
  });

  test('pie chart looks ok', async () => {
    const dataViewContent = await page
      .locator('[class*=plotBlockStyles]')
      .screenshot();

    expect(dataViewContent).toMatchSnapshot('initial-pie-chart.png');
  });

  test('updates chart name', async () => {
    await page.getByPlaceholder('Chart title').dblclick();
    await page.keyboard.type('NewChartName');
    await page.isVisible("text='NewChartName'");
  });

  test('puts old chart name back', async () => {
    await page.getByPlaceholder('Chart title').dblclick();
    await page.keyboard.type('Chart');
    await page.isVisible("text='Chart'");
  });

  test('test pie chart menu', async () => {
    await page.getByTestId('chart-settings-button').click();
    const pieChartMenu = await page
      .getByTestId('chart-settings-menu')
      .screenshot();

    expect(pieChartMenu).toMatchSnapshot('pie-chart-menu.png');
  });

  test('change color scheme', async () => {
    await page.getByText('Color scheme').click();
    await page.getByText('Monochrome').click();
    await page.getByText('Purple').click();

    const dataViewContent = await page
      .locator('[class*=plotBlockStyles]')
      .screenshot();

    expect(dataViewContent).toMatchSnapshot('purple-pie-chart.png');
  });

  test('convert to bar chart', async () => {
    await page.getByTestId('chart-settings-button').click();
    await page.getByText('Chart type').click();
    await page.getByTestId('chart__settings__chart-type__bar').click();

    const dataViewContent = await page
      .locator('[class*=plotBlockStyles]')
      .screenshot();

    expect(dataViewContent).toMatchSnapshot('bar-chart.png');
  });

  test('bar chart menu', async () => {
    await page.getByTestId('chart-settings-button').click();
    const pieChartMenu = await page
      .getByTestId('chart-settings-menu')
      .screenshot();

    expect(pieChartMenu).toMatchSnapshot('bar-chart-menu.png');
  });

  test('swap axes', async () => {
    await page.getByText('label').click();
    await page.getByTestId('chart__settings__label__Column2').click();

    await page.getByTestId('chart-settings-button').click();
    await page.getByRole('menuitem', { name: 'Value Column2' }).click();
    await page.getByTestId('chart__settings__value__Column1').click();

    const dataViewContent = await page
      .locator('[class*=plotBlockStyles]')
      .screenshot();

    expect(dataViewContent).toMatchSnapshot('swapped-bar-chart.png');
  });

  test('convert to scatter chart', async () => {
    await page.getByTestId('chart-settings-button').click();
    await page.getByText('Chart type').click();
    await page.getByTestId('chart__settings__chart-type__point').click();

    const dataViewContent = await page
      .locator('[class*=plotBlockStyles]')
      .screenshot();

    expect(dataViewContent).toMatchSnapshot('scatter-plot.png');
  });

  test('scatter plot menu', async () => {
    await page.getByTestId('chart-settings-button').click();
    const pieChartMenu = await page
      .getByTestId('chart-settings-menu')
      .screenshot();

    expect(pieChartMenu).toMatchSnapshot('scatter-plot-menu.png');
  });
});
