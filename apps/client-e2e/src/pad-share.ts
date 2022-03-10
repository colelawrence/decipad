/* eslint-disable jest/expect-expect */
import type { Page } from 'playwright';
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
    const linkSelector = 'text=//n/hello-world/';
    await page.click('text=share');
    await page.click('[aria-checked="false"]');
    await page.waitForSelector(linkSelector);

    link = await page.innerText(linkSelector);
    expect(link.length).toBeGreaterThan(0);
  }, 60000);

  let otherUserPage: Page;
  test('another user can join on the given link', async () => {
    const newContext = await browser.newContext();
    otherUserPage = await newContext.newPage();

    // Meet Bob, a new user. Bob, go do your thing.
    await withNewUser(newContext);

    await otherUserPage.goto(link);
    await waitForEditorToLoad(otherUserPage);

    await otherUserPage.waitForSelector('text=hello world');
    expect(await otherUserPage.$$('[contenteditable] p')).toHaveLength(4);
  });

  test('the other user can duplicate', async () => {
    await otherUserPage.click('text=Duplicate notebook');
    await otherUserPage.click('text=Copy of hello world');

    await waitForEditorToLoad(otherUserPage);
    await otherUserPage.waitForSelector('text=hello world');
    expect(await otherUserPage.$$('[contenteditable] p')).toHaveLength(4);
  }, 60000);
});
