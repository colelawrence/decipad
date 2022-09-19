import { Page } from 'playwright-core';
import waitForExpect from 'wait-for-expect';
import { createCalculationBlockBelow } from './page-utils/Block';
import { setUp, waitForEditorToLoad } from './page-utils/Pad';
import { snapshot } from './utils';

// eslint-disable-next-line jest/no-disabled-tests
describe('auto complete menu', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  it('creates a variable', async () => {
    await createCalculationBlockBelow('MyVar = 68 + 1');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow('OtherVare = 419 + 1');
    await waitForExpect(async () => {
      expect(
        (await page.$$("span:has-text('69')")).length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens menu when cursor is at the end of a word', async () => {
    await createCalculationBlockBelow('MyV');
    await waitForExpect(async () => {
      expect(await page.$('.test-auto-complete-menu')).not.toBeNull();
    });
    // Wait for result to appear. Avoids flaky snapshots.
    await waitForExpect(async () => {
      expect(
        (await page.$$("span:has-text('1 MyV')")).length
      ).toBeGreaterThanOrEqual(1);
    });
    await snapshot(page as Page, 'Auto Complete Menu: Open');
  });

  it('filters menu based on word before cursor', async () => {
    await waitForExpect(async () => {
      expect(
        await page.$(
          ".test-auto-complete-menu button:has-text('MyVar'):first-child:last-child"
        )
      ).not.toBeNull();
    });
  });

  it('completes the name of the variable on click', async () => {
    await page.click(".test-auto-complete-menu button:has-text('MyVar')");
    // focus
    // profit
    await waitForExpect(async () => {
      expect(await page.$('.test-auto-complete-menu')).toBeNull();
      expect(await page.$$("code:has-text('MyVar')")).toHaveLength(2);
    });
  });
});
