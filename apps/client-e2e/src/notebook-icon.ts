import { setUp } from './page-utils/Pad';

describe('Notebook Icon', () => {
  beforeAll(() => setUp());

  it('renders the initial color and icon', async () => {
    const button = page.locator('div[aria-haspopup="dialog"]');
    expect(await button.locator('title').textContent()).toBe('Rocket');
    const initialColor = await button.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    expect(initialColor).toBe('rgb(236, 240, 246)');
  });

  it('changes the color of the icon', async () => {
    const button = page.locator('div[aria-haspopup="dialog"]');
    await button.click();

    const green = await page.waitForSelector('button[aria-label="Sulu"]');
    await green?.click();

    await page.waitForTimeout(200);

    const buttonColor = await page
      .locator('div[aria-haspopup="dialog"]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(buttonColor).toBe('rgb(193, 250, 107)');

    await button.click();
  });

  it('changes the icon', async () => {
    const button = page.locator('div[aria-haspopup="dialog"]');
    await button.click();

    const moon = await page.waitForSelector('button[aria-label="Moon"]');
    await moon.click();

    expect(
      await page.locator('div[aria-haspopup="dialog"] title').textContent()
    ).toBe('Moon');
  });
});
