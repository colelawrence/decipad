/* eslint-disable jest/expect-expect */
import waitForExpect from 'wait-for-expect';
import { setUp } from './page-utils/Pad';

waitForExpect.defaults.interval = 1000;

describe('Share pad', () => {
  let link: string;
  beforeAll(setUp);

  beforeAll(async () => {
    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the first paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the second paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the third paragraph');

    expect(await page.$$('[contenteditable] p')).toHaveLength(4);
  }, 60000);

  test('click share button and extract text', async () => {
    const linkSelector = 'text=/workspaces/[^/]+/';
    await page.click('text=share');
    await page.click('[aria-checked="false"]');
    await page.waitForSelector(linkSelector);

    link = await page.innerText(linkSelector);
    expect(link.length).toBeGreaterThan(0);
  }, 60000);

  test('another browser joins on the given link', async () => {
    const context = await browser.newContext();
    const newPage = await context.newPage();
    expect(link.length).toBeGreaterThan(0);

    await newPage.goto(link);
    expect(await page.$$('[contenteditable] p')).toHaveLength(4);
  });
});
