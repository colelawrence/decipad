import percySnapshot from '@percy/playwright';
import type { Page } from 'playwright';
import waitForExpect from 'wait-for-expect';
import { setUp, waitForEditorToLoad } from './page-utils/Pad';
import { withTestUser } from './utils';

waitForExpect.defaults.interval = 1000;
let link: string;

describe('notebook share', () => {
  beforeAll(() => setUp());

  test('screenshots the slash commands', async () => {
    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/');

    const linkSelector = 'text=Calculations';
    const calculations = await page.$(linkSelector);
    expect(calculations).toBeTruthy();

    await percySnapshot(page, 'Notebook: Slash Command');

    await page.keyboard.press('Backspace');
  });

  test('click share button and extract text', async () => {
    const linkSelector = 'text=//n/hello-world/';
    await page.click('text=share');
    await page.click('[aria-checked="false"]');
    await percySnapshot(page, 'Notebook: Share Popover');
    await page.waitForSelector(linkSelector);

    link = await page.innerText(linkSelector);
    expect(link.length).toBeGreaterThan(0);
  }, 60000);

  let otherUserPage: Page;
  test('another user can join on the given link', async () => {
    const newContext = await browser.newContext();
    otherUserPage = await newContext.newPage();

    // Meet Bob, a new user. Bob, go do your thing.
    await withTestUser({ ctx: newContext, p: otherUserPage });

    await otherUserPage.goto(link);
    await waitForEditorToLoad(otherUserPage);

    await otherUserPage.waitForSelector('text=hello world');
    expect(await otherUserPage.$$('[contenteditable] p')).toHaveLength(2);
  });

  test('the other user can duplicate', async () => {
    await otherUserPage.click('text=Duplicate notebook');
    await otherUserPage.click('text=Copy of hello world');

    await waitForEditorToLoad(otherUserPage);
    await otherUserPage.waitForSelector('text=hello world');

    expect(await otherUserPage.$$('[contenteditable] p')).toHaveLength(2);
  }, 60000);

  let incognitoUserPage: Page;
  test('incognito browser given link', async () => {
    const newContext = await browser.newContext();
    incognitoUserPage = await newContext.newPage();

    await incognitoUserPage.goto(link);
    await waitForEditorToLoad(incognitoUserPage);

    await incognitoUserPage.waitForSelector('text=hello world');
    expect(await incognitoUserPage.$$('[contenteditable] p')).toHaveLength(2);
  });
});
