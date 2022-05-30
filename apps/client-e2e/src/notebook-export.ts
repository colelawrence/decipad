/* eslint-disable jest/expect-expect */
import { initialWorkspace } from '@decipad/initial-workspace';
import { timeout } from '@decipad/utils';
import waitForExpect from 'wait-for-expect';
import { setUp } from './page-utils/Pad';
import {
  exportPad,
  getPadList,
  navigateToWorkspacePage,
} from './page-utils/Workspace';

describe('notebook export', () => {
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
    // Not sure why the first h1 and last p don't have ids, they're probably the original elements
    // of the document but from what I could test on the deployed code they do have ids when exported.
    expect(JSON.parse(await exportPad(padToCopyIndex))).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'pad title here',
            },
          ],
          type: 'h1',
        },
        {
          children: [
            {
              text: 'this is the first paragraph',
            },
          ],
          type: 'p',
          id: expect.any(String),
        },
        {
          children: [
            {
              text: 'this is the second paragraph',
            },
          ],
          type: 'p',
          id: expect.any(String),
        },
        {
          children: [
            {
              text: 'this is the third paragraph',
            },
          ],
          type: 'p',
          id: expect.any(String),
        },
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'p',
        },
      ],
    });
  });
});
