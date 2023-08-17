import { BrowserContext, expect, Page, test } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createTable, writeInTable } from '../utils/page/Table';

const getTableCellRenderCount = (page: Page) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page.evaluate(() => (window as any).tableCellRenderCount);

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const STOP_RENDERING_POLL_INTERVAL = 5000;
const STOP_RENDERING_MAX_POLL_COUNT = 6;

const waitUntilStopRendering = async (page: Page): Promise<number> => {
  let previousRenderCount = await getTableCellRenderCount(page);

  for (let i = 0; i < STOP_RENDERING_MAX_POLL_COUNT; i += 1) {
    await wait(STOP_RENDERING_POLL_INTERVAL);
    const renderCount = await getTableCellRenderCount(page);
    if (renderCount === previousRenderCount) return renderCount;
    previousRenderCount = renderCount;
  }

  throw new Error('Timeout exceeded while waiting for table to stop rendering');
};

test.describe('Count how many times table cells render', () => {
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

  test('count initial renders', async () => {
    await focusOnBody(page);
    await createTable(page);

    const renderCount = await waitUntilStopRendering(page);

    /**
     * If this fails with a number less than what's currently expected, reduce
     * the expected count. Congratulations, you've made tables more efficient!
     */
    const cellCount = 9;
    const expectedPerCell = 3;
    expect(renderCount).toBe(cellCount * expectedPerCell);
  });

  test('count renders in response to a single keystroke', async () => {
    await writeInTable(page, 'a', 1, 1);
    const previousRenderCount = await waitUntilStopRendering(page);
    await writeInTable(page, 'b', 1, 1);
    const renderCount = await waitUntilStopRendering(page);

    expect(renderCount).toBeGreaterThan(0);

    /**
     * If this fails with a number less than what's currently expected, reduce
     * the expected count. Congratulations, you've made tables more efficient!
     */
    expect(renderCount - previousRenderCount).toBe(2);
  });
});
