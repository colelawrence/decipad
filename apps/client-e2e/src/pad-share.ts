/* eslint-disable jest/expect-expect */
import waitForExpect from 'wait-for-expect';
import { getPadContent, setUp } from './page-utils/Pad';

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
    expect(await getPadContent()).toMatchInlineSnapshot(`
Array [
  Object {
    "text": "hello world",
    "type": "h1",
  },
  Object {
    "text": "this is the first paragraph",
    "type": "p",
  },
  Object {
    "text": "this is the second paragraph",
    "type": "p",
  },
  Object {
    "text": "this is the third paragraph",
    "type": "p",
  },
  Object {
    "text": "",
    "type": "p",
  },
]
`);
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
    await waitForExpect(async () => {
      expect(await getPadContent(newPage)).toMatchObject([
        {
          text: 'hello world',
          type: 'h1',
        },
        {
          text: 'this is the first paragraph',
          type: 'p',
        },
        {
          text: 'this is the second paragraph',
          type: 'p',
        },
        {
          text: 'this is the third paragraph',
          type: 'p',
        },
        {
          text: '',
          type: 'p',
        },
      ]);
    });
  });
});
