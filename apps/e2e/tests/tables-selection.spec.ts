import { expect, test } from './manager/decipad-tests';
import { ControlPlus } from '../utils/page/Editor';
import {
  createTable,
  clickCell,
  isCellSelected,
  getSelectionGrid,
  hoverCell,
  writeInTable,
  getFromTable,
  doubleClickCell,
} from '../utils/page/Table';
import { Timeouts } from '../utils/src';

test('Table Selection', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await createTable(page);

  await test.step('selects using arrow keys', async () => {
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
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await isCellSelected(page, 2, 1)).toBe(true);
    }).toPass();

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
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await page.keyboard.press('ArrowDown');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await page.keyboard.press('ArrowLeft');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await page.keyboard.press('ArrowLeft');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await page.keyboard.press('ArrowUp');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await page.keyboard.press('ArrowUp');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await isCellSelected(page, 1, 0)).toBe(true);
    }).toPass();
  });

  await test.step('selects using shift + arrow keys', async () => {
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

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await isCellSelected(page, 2, 1)).toBe(true);
    }).toPass();

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

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await isCellSelected(page, 2, 1)).toBe(true);
    }).toPass();

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

  await test.step('selects with shift + click', async () => {
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

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await isCellSelected(page, 3, 0)).toBe(true);
    }).toPass();

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

  await test.step('selects with click + drag', async () => {
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

  await test.step('selects all', async () => {
    await writeInTable(page, 'x', 1, 2);

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await getFromTable(page, 1, 2)).toBe('x');
    }).toPass();

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

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await getFromTable(page, 1, 2)).toBe('');
    }).toPass();
  });

  await test.step('starts editing on type', async () => {
    await writeInTable(page, 'Initial value', 2, 1);

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.tableDelay);
    await expect(async () => {
      expect(await getFromTable(page, 2, 1)).toBe('Initial value');
    }).toPass();

    await clickCell(page, 3, 2);
    await clickCell(page, 2, 1);

    await page.keyboard.press('T');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.keyboard.type('emporary value');
    await page.keyboard.press('Escape');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);

    await expect(async () => {
      expect(await getFromTable(page, 2, 1)).toBe('Initial value');
    }).toPass();

    await clickCell(page, 3, 2);
    await clickCell(page, 2, 1);

    await page.keyboard.press('N');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.keyboard.type('ew value');
    await page.keyboard.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await expect(async () => {
      expect(await getFromTable(page, 2, 1)).toBe('New value');
    }).toPass();
  });
});

test('selects using tab while editing', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await doubleClickCell(page, 2, 1);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.press('Tab');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 2, 2)).toBe(true);
  }).toPass();
});

test('selects using shift + tab while editing', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await doubleClickCell(page, 2, 1);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 2, 0)).toBe(true);
  }).toPass();
});

test('selects using tab while not editing', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await clickCell(page, 1, 1);
  await page.keyboard.press('Tab');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 1, 2)).toBe(true);
  }).toPass();
});

test('selects using enter while editing', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await doubleClickCell(page, 2, 1);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.press('Enter');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 3, 1)).toBe(true);
  }).toPass();
});

test('selects using shift + enter while editing', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await doubleClickCell(page, 2, 1);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.down('Shift');
  await page.keyboard.press('Enter');
  await page.keyboard.up('Shift');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 1, 1)).toBe(true);
  }).toPass();
});

test('selects using arrow up while editing', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await doubleClickCell(page, 2, 1);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.press('ArrowUp');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 1, 1)).toBe(true);
  }).toPass();
});

test('selects using arrow down while editing', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await doubleClickCell(page, 2, 1);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.press('ArrowDown');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 3, 1)).toBe(true);
  }).toPass();
});

test('selects using arrow down while editing on the last row', async ({
  testUser,
}) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await createTable(page);
  await doubleClickCell(page, 3, 1);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await page.keyboard.press('ArrowDown');
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.tableDelay);
  await expect(async () => {
    expect(await isCellSelected(page, 3, 1)).toBe(true);
  }).toPass();
});
