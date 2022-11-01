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
  beforeAll(setUp);

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
      padToCopyIndex = pads.findIndex(
        (pad) => pad.name === 'My notebook titlepad title here'
      );
      expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    });
  });

  test('exports pad', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    expect(JSON.parse(await exportPad(padToCopyIndex))).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'My notebook titlepad title here',
            },
          ],
          type: 'h1',
          id: expect.any(String),
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
          id: expect.any(String),
        },
      ],
    });
  });
});
