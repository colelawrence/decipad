import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import {
  clickNewPadButton,
  duplicatePad,
  getPadList,
  removePad,
} from '../utils/page/Workspace';
import { snapshot, Timeouts } from '../utils/src';

const byName = (a: { name: string }, b: { name: string }): number => {
  return a.name.localeCompare(b.name);
};

test.describe('Dashboard snapshot', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await setUp({ page, context }, { createAndNavigateToNewPad: false });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should display the initial notebooks', async () => {
    const pads = await (await getPadList(page)).sort(byName);
    expect(pads).toMatchObject(
      [
        'Welcome to Decipad!',
        'Starting a Business - Example Notebook',
        'Weekend Trip - Example Notebook',
      ]
        .map((notebook) => ({
          name: notebook,
        }))
        .sort(byName)
    );
    await snapshot(page as Page, 'Dashboard: Initial Notebooks');
  });
});

test.describe('Dashboard operations', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await setUp({ page, context }, { createAndNavigateToNewPad: false });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates a new pad and navigates to pad detail', async () => {
    await Promise.all([
      clickNewPadButton(page),
      page.waitForNavigation({ url: '/n/*' }),
    ]);

    await page.goBack();
  });

  test('can remove pad', async () => {
    const padIndex = (await getPadList(page)).findIndex(
      (pad) => pad.name !== 'My first pad'
    );
    expect(padIndex).toBeGreaterThanOrEqual(0);
    await removePad(page, padIndex);

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    const pads = await getPadList(page);
    expect(pads).toHaveLength(3);
  });

  test('can duplicate pad', async () => {
    await duplicatePad(page, 0);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    let pads = await getPadList(page);

    expect(pads).toHaveLength(4);

    pads = await getPadList(page);
    const copyIndex = pads.findIndex((pad) => pad.name?.startsWith('Copy of'));
    expect(copyIndex).toBeGreaterThanOrEqual(0);
  });

  test('can navigate to pad detail', async () => {
    const pads = await getPadList(page);
    expect(pads.length).toBeGreaterThan(0);
    const pad = pads[0];
    await pad.anchor.click();
    expect(page.url()).toMatch(/\/n\/[^/]+/);
    await page.goBack();
  });
});
