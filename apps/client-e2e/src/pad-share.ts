/* eslint-disable jest/expect-expect */
import waitForExpect from 'wait-for-expect';
import { setUp, waitForEditorToLoad } from './page-utils/Pad';
import { withNewUser } from './utils';

waitForExpect.defaults.interval = 1000;
let link: string;

describe('Share pad', () => {
  beforeAll(() => setUp());

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

    //
    // meet bob, a new user
    // bob, go do your thing
    //
    await withNewUser(context);
    await newPage.goto(link);

    await newPage.waitForSelector('text=Duplicate notebook');

    await newPage.click('text=Duplicate notebook');

    await newPage.waitForSelector('text=Copy of hello world');
    await newPage.click('text=Copy of hello world');

    await waitForEditorToLoad(newPage);
    expect(await newPage.$$('[contenteditable] p')).toHaveLength(4);
  });
});
