import { BrowserContext, expect, Page, test } from '@playwright/test';
import { ControlPlus, focusOnBody, setUp } from '../utils/page/Editor';
import {
  createTable,
  clickCell,
  isCellSelected,
  getSelectionGrid,
  hoverCell,
  writeInTable,
  getFromTable,
  doubleClickCell,
  deleteTable,
} from '../utils/page/Table';
import { Timeouts } from '../utils/src';

test.describe('Table Selection', () => {
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

    await focusOnBody(page);
    await createTable(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('selects using arrow keys', async () => {
    /**
     * +-+-+-+
     * | | | | 1
     * +-+-+-+
     * | |S| | 2
     * +-+-+-+
     * | | | | 3
     * +-+-+-+
     *  0 1 2
     */
    await clickCell(page, 2, 1);
    expect(await isCellSelected(page, 2, 1)).toBe(true);

    /**
     * +-+-+-+
     * |S| | | 1
     * +-+-+-+
     * | | | | 2
     * +-+-+-+
     * | | | | 3
     * +-+-+-+
     *  0 1 2
     */
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    expect(await isCellSelected(page, 1, 0)).toBe(true);
  });

  test('selects using shift + arrow keys', async () => {
    /**
     * +-+-+-+
     * | | | | 1
     * +-+-+-+
     * | |S| | 2
     * +-+-+-+
     * | | | | 3
     * +-+-+-+
     *  0 1 2
     */
    await clickCell(page, 2, 1);
    expect(await isCellSelected(page, 2, 1)).toBe(true);

    /**
     * +-+-+-+
     * | | | | 1
     * +-+-+-+
     * | |A|.| 2
     * +-+-+-+
     * | |.|F| 3
     * +-+-+-+
     *  0 1 2
     */
    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.up('Shift');

    expect(await getSelectionGrid(page)).toEqual({
      start: { line: 2, col: 1 },
      end: { line: 3, col: 2 },
    });

    /**
     * +-+-+-+
     * | | | | 1
     * +-+-+-+
     * | |S| | 2
     * +-+-+-+
     * | | | | 3
     * +-+-+-+
     *  0 1 2
     */
    await clickCell(page, 2, 1);
    expect(await isCellSelected(page, 2, 1)).toBe(true);

    /**
     * +-+-+-+
     * |F|.| | 1
     * +-+-+-+
     * |.|A| | 2
     * +-+-+-+
     * | | | | 3
     * +-+-+-+
     *  0 1 2
     */
    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.up('Shift');

    expect(await getSelectionGrid(page)).toEqual({
      start: { line: 1, col: 0 },
      end: { line: 2, col: 1 },
    });
  });

  test('selects with shift + click', async () => {
    /**
     * +-+-+-+
     * | | | | 1
     * +-+-+-+
     * | | | | 2
     * +-+-+-+
     * |S| | | 3
     * +-+-+-+
     *  0 1 2
     */
    await clickCell(page, 3, 0);
    expect(await isCellSelected(page, 3, 0)).toBe(true);

    /**
     * +-+-+-+
     * | | | | 1
     * +-+-+-+
     * |.|.|F| 2
     * +-+-+-+
     * |A|.|.| 3
     * +-+-+-+
     *  0 1 2
     */
    await page.keyboard.down('Shift');
    await clickCell(page, 2, 2);
    await page.keyboard.up('Shift');

    expect(await getSelectionGrid(page)).toEqual({
      start: { line: 2, col: 0 },
      end: { line: 3, col: 2 },
    });
  });

  test('selects with click + drag', async () => {
    /**
     * +-+-+-+
     * | |A|.| 1
     * +-+-+-+
     * | |.|.| 2
     * +-+-+-+
     * | |.|F| 3
     * +-+-+-+
     *  0 1 2
     */
    await hoverCell(page, 1, 1);
    await page.mouse.down();
    await hoverCell(page, 3, 2);
    await page.mouse.up();

    expect(await getSelectionGrid(page)).toEqual({
      start: { line: 1, col: 1 },
      end: { line: 3, col: 2 },
    });
  });

  test('selects all', async () => {
    await writeInTable(page, 'x', 1, 2);
    expect(await getFromTable(page, 1, 2)).toBe('x');

    /**
     * +-+-+-+
     * | | |x| 1
     * +-+-+-+
     * | |S| | 2
     * +-+-+-+
     * | | | | 3
     * +-+-+-+
     *  0 1 2
     */
    await clickCell(page, 1, 1);

    /**
     * +-+-+-+
     * |A|.|x| 1
     * +-+-+-+
     * |.|.|.| 2
     * +-+-+-+
     * |.|.|F| 3
     * +-+-+-+
     *  0 1 2
     */
    await ControlPlus(page, 'a');

    expect(await getSelectionGrid(page)).toEqual({
      start: { line: 1, col: 0 },
      end: { line: 3, col: 2 },
    });

    await page.keyboard.press('Backspace');
    expect(await getFromTable(page, 1, 2)).toBe('');
  });

  test('starts editing on type', async () => {
    await writeInTable(page, 'Initial value', 2, 1);
    expect(await getFromTable(page, 2, 1)).toBe('Initial value');

    await clickCell(page, 3, 2);
    await clickCell(page, 2, 1);

    await page.keyboard.press('T');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.keyboard.type('emporary value');
    await page.keyboard.press('Escape');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);

    expect(await getFromTable(page, 2, 1)).toBe('Initial value');

    await clickCell(page, 3, 2);
    await clickCell(page, 2, 1);

    await page.keyboard.press('N');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.keyboard.type('ew value');
    await page.keyboard.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);

    expect(await getFromTable(page, 2, 1)).toBe('New value');
  });

  test('selects using tab while editing', async () => {
    await deleteTable(page);
    await createTable(page);
    await doubleClickCell(page, 1, 1);
    await page.keyboard.press('Tab');
    expect(await isCellSelected(page, 1, 2)).toBe(true);
  });

  test('selects using tab while not editing', async () => {
    await deleteTable(page);
    await createTable(page);
    await clickCell(page, 1, 1);
    await page.keyboard.press('Tab');
    expect(await isCellSelected(page, 1, 2)).toBe(true);
  });
});
