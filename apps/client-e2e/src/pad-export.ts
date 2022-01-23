/* eslint-disable jest/expect-expect */
import { timeout } from '@decipad/utils';
import { initialWorkspace } from '@decipad/initial-workspace';
import waitForExpect from 'wait-for-expect';
import { setUp } from './page-utils/Pad';
import {
  navigateToWorkspacePage,
  exportPad,
  getPadList,
} from './page-utils/Workspace';

describe('Duplicate pad', () => {
  let padToCopyIndex = -1;
  beforeAll(() => setUp());

  beforeAll(async () => {
    await page.keyboard.type('pad title here');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the first paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the second paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the third paragraph');
    await timeout(4000);
    await navigateToWorkspacePage();

    // make sure pad is there
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(initialWorkspace.notebooks.length + 1);
      padToCopyIndex = pads.findIndex((pad) => pad.name === 'pad title here');
      expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    });
  });

  test('exports pad', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    expect(JSON.parse(await exportPad(padToCopyIndex))).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "text": "pad title here",
            },
          ],
          "type": "h1",
        },
        Object {
          "children": Array [
            Object {
              "text": "this is the first paragraph",
            },
          ],
          "type": "p",
        },
        Object {
          "children": Array [
            Object {
              "text": "this is the second paragraph",
            },
          ],
          "type": "p",
        },
        Object {
          "children": Array [
            Object {
              "text": "this is the third paragraph",
            },
          ],
          "type": "p",
        },
        Object {
          "children": Array [
            Object {
              "text": "",
            },
          ],
          "type": "p",
        },
      ],
    }
    `);
  });
});
