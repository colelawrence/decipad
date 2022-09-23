import waitForExpect from 'wait-for-expect';
import { createCalculationBlockBelow } from './page-utils/Block';
import { waitForEditorToLoad, setUp, focusOnBody } from './page-utils/Pad';

describe('notebook result widget', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  it('creates an empty result widget', async () => {
    await focusOnBody();
    await page.keyboard.type('/result');
    await page.locator('button >> span >> svg').click();

    const result = page.locator('text=Select an option');

    expect(await result.count()).toBe(1);
  });

  it('shows the available calculations', async () => {
    await focusOnBody();
    await createCalculationBlockBelow('Hello = 5 + 1');
    await createCalculationBlockBelow('World = 5 + 3');

    await page.locator('[data-testid="result-widget"]').click();

    await waitForExpect(async () => {
      expect(await page.locator('button >> span + div').count()).toBe(2);
    });

    expect(
      await page.locator('button >> span + div:has-text("Hello")').count()
    ).toBe(1);
    expect(
      await page.locator('button >> span + div:has-text("World")').count()
    ).toBe(1);
  });

  it('shows the result of a calculation', async () => {
    await page.locator('button >> span + div:has-text("hello")').click();

    await waitForExpect(async () => {
      expect(
        await page
          .locator('[data-testid="result-widget"]:has-text("6")')
          .count()
      ).toBe(1);
    });
  });

  it('updates the result when calculation changes', async () => {
    await page.locator('text=Hello = 5 + 1').click();
    await page.keyboard.press('End');
    await page.keyboard.type(' + 4');

    await waitForExpect(async () => {
      expect(
        await page
          .locator('[data-testid="result-widget"]:has-text("10")')
          .count()
      ).toBe(1);
    });
  });

  it('doesnt show tables nor formulas on widget dropdown', async () => {
    await createCalculationBlockBelow('table = { hello = [1, 2, 3] }');
    await createCalculationBlockBelow('f(x) = x + 10');

    await page.waitForTimeout(200);
    await page.locator('[data-testid="result-widget"]').click();

    await waitForExpect(async () => {
      expect(await page.locator('button >> span + div').count()).toBe(2);
    });
  });
});
