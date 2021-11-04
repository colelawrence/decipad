/* eslint-disable jest/expect-expect */
import { getPadName, setUp } from './page-utils/Pad';

describe('Share pad', () => {
  let link: string;
  beforeAll(setUp);

  beforeAll(async () => {
    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
  });

  test('click share button and extract text', async () => {
    const linkSelector = 'text=/workspaces/[^/]+/';
    await page.click('text=share');
    await page.waitForSelector(linkSelector);
    link = await page.innerText(linkSelector);
  });

  test('another browser joins on the given link', async () => {
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.goto(link);
    expect(await getPadName()).toBe('hello world');
  });
});
