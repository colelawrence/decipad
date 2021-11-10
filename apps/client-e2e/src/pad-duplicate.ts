/* eslint-disable jest/expect-expect */
import { timeout } from '@decipad/utils';
import waitForExpect from 'wait-for-expect';
import { setUp, waitForEditorToLoad, getPadContent } from './page-utils/Pad';
import {
  navigateToWorkspacePage,
  duplicatePad,
  getPadList,
  followPad,
} from './page-utils/Workspace';

describe('Duplicate pad', () => {
  let padToCopyIndex = -1;
  let padCopyIndex = -1;
  beforeAll(setUp);

  beforeAll(async () => {
    await page.keyboard.type('pad title here');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the first paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the second paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the third paragraph');
    await timeout(10000);
    await navigateToWorkspacePage();

    // make sure pad is there
    await waitForExpect(async () => {
      const pads = await getPadList();
      expect(pads).toHaveLength(2);
      padToCopyIndex = pads.findIndex((pad) => pad.name === 'pad title here');
      expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    });
  });

  test('duplicates pad', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    await duplicatePad(padToCopyIndex);

    // pad was copied
    await waitForExpect(async () => {
      const pads = await getPadList();
      padCopyIndex = pads.findIndex(
        (pad) => pad.name.toLocaleLowerCase() === 'copy of pad title here'
      );
      expect(padCopyIndex).toBeGreaterThanOrEqual(0);
    });

    // pad content was copied
    await followPad(padCopyIndex);
    await waitForEditorToLoad();
    await waitForExpect(async () => {
      expect((await getPadContent()).slice(0, 4)).toMatchObject([
        {
          text: 'pad title here',
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
      ]);
    });
  });
});
