/* eslint-disable jest/expect-expect */
import { timeout } from '@decipad/utils';
import {
  focusOnBody,
  getPadContent,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';

describe('pad content', () => {
  beforeAll(setUp);

  beforeEach(waitForEditorToLoad);

  it('type lots of stuff', async () => {
    await focusOnBody();
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
    "text": "",
    "type": "h1",
  },
  Object {
    "text": "hello world",
    "type": "p",
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
]
`);
    await timeout(1000);
  });

  it('stuff is there after reload', async () => {
    await page.reload();
    await waitForEditorToLoad();
    expect(await getPadContent()).toMatchInlineSnapshot(`
      Array [
        Object {
          "text": "",
          "type": "h1",
        },
        Object {
          "text": "hello world",
          "type": "p",
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
      ]
    `);
  });
});
