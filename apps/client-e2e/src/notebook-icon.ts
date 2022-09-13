import { Page } from 'playwright-core';
import { setUp } from './page-utils/Pad';
import { snapshot } from './utils';

describe('notebook icon', () => {
  beforeAll(() => setUp());

  it('renders the initial color and icon', async () => {
    const button = page.locator('button[aria-haspopup="dialog"]');
    expect(await button.locator('title').textContent()).toBe('Rocket');
    const initialColor = await button.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    expect(initialColor).toBe('rgb(236, 240, 246)');
  });

  it('changes the color of the icon', async () => {
    const button = page.locator('button[aria-haspopup="dialog"]');
    await button.click();

    const green = await page.waitForSelector('button[aria-label="Sulu"]');
    await green?.click();

    await page.waitForTimeout(200);
    await snapshot(page as Page, 'Notebook: Icon selection');

    const buttonColor = await page
      .locator('button[aria-haspopup="dialog"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(buttonColor).toBe('rgb(193, 250, 107)');

    await button.click();
  });

  it('changes the icon', async () => {
    const button = page.locator('button[aria-haspopup="dialog"]');
    await button.click();

    const moon = await page.waitForSelector('button[aria-label="Moon"]');
    await moon.click();

    expect(
      await page.locator('button[aria-haspopup="dialog"] title').textContent()
    ).toBe('Moon');
  });
});
