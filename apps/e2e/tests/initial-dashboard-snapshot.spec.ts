import { BrowserContext, expect, Page, test } from '@playwright/test';
import waitForExpect from 'wait-for-expect';
import { setUp } from '../utils/page/Editor';
import {
  clickNewPadButton,
  duplicatePad,
  getPadList,
  removePad,
} from '../utils/page/Workspace';
import { snapshot } from '../utils/src';

const byName = (a: { name: string }, b: { name: string }): number => {
  return a.name.localeCompare(b.name);
};

test.describe('Dashboard snapshot', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let localStorageValue: string | null;

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

    // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
    process.env.CI || process.env.DECI_E2E
      ? expect(pads).toMatchObject(
          [
            'Welcome to Decipad!',
            'Starting a Business - Example Notebook',
            'Weekend Trip - Example Notebook',
          ]
            .map((notebook) => ({ name: notebook }))
            .sort(byName)
        )
      : expect(pads).toMatchObject(
          [
            '[Template] Capitalisation table for seed founders',
            '[Template] Decipad Investor Update: Mar 2023',
            '[Template] How much is Apple worth? Breaking down a DCF model.',
            '[Template] Offer Letter',
            '[Template] Performance summary letter',
            '[Template] Sales Report: Monthly Pipeline Update',
            '[Template] Shilling Founders Fund | An innovative approach to profit sharing',
            '[Template] Sprint Capacity Calculation for Scrum Teams',
            '[Template] Understanding stock options at an early stage startup',
            'Everything, everywhere, all at once',
            'Very weird loading when editing',
            'Welcome to Decipad!',
            'Starting a Business - Example Notebook',
            'Weekend Trip - Example Notebook',
          ]
            .map((notebook) => ({ name: notebook }))
            .sort(byName)
        );

    await snapshot(page as Page, 'Dashboard: Initial Notebooks');
  });

  test.use({ colorScheme: 'dark' });

  test('shows workspace in dark mode mode', async () => {
    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'dark');
        return window.localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('dark');
      }
    });
    await page.reload({ waitUntil: 'load' });
    await snapshot(page as Page, 'Dashboard: Initial Notebooks Darkmode');
  });

  test.use({ colorScheme: 'light' });

  test('shows workspace in light mode mode', async () => {
    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'light');
        return localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('light');
      }
    });
    await page.reload({ waitUntil: 'load' });
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

    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      const pads = await getPadList(page);
      // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
      process.env.CI || process.env.DECI_E2E
        ? expect(pads).toHaveLength(3)
        : expect(pads).toHaveLength(14);
    });
  });

  test('can duplicate pad', async () => {
    await duplicatePad(page);

    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      let pads = await getPadList(page);
      // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
      process.env.CI
        ? expect(pads).toHaveLength(4)
        : expect(pads).toHaveLength(15);

      pads = await getPadList(page);
      const copyIndex = pads.findIndex((pad) =>
        pad.name?.startsWith('Copy of')
      );
      expect(copyIndex).toBeGreaterThanOrEqual(0);
    });
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
