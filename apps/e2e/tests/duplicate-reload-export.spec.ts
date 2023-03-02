import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';
import {
  duplicatePad,
  exportPad,
  followPad,
  getPadList,
  navigateToWorkspacePage,
} from '../utils/page/Workspace';
import { Timeouts } from '../utils/src';

test.describe('Duplicating a notebook', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let padToCopyIndex = -1;
  let padCopyIndex = -1;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Makes up a notebook', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.keyboard.type('pad title here');
    await page.keyboard.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.keyboard.type('this is the first paragraph');
    await page.keyboard.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);
    await page.keyboard.type('this is the second paragraph');
    await page.keyboard.press('Enter');
    await page.keyboard.type('this is the third paragraph');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);

    await page.waitForSelector('text=this is the third paragraph');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay * 2);
  });

  test('Can reload', async () => {
    await page.reload();
    await waitForEditorToLoad(page);
    const lastParagraph = await page.waitForSelector(
      'text=this is the third paragraph'
    );
    expect(await lastParagraph.isVisible()).toBeTruthy();
    await navigateToWorkspacePage(page);
  });

  test('Check if notebook has 4 paragraphs', async () => {
    await page.waitForSelector('text=My notebook titlepad title here');

    await page.click('text=My notebook titlepad title here');
    await expect(
      page.locator('text=this is the third paragraph')
    ).toBeVisible();
    await expect(page.locator('[data-testid="paragraph-wrapper"]')).toHaveCount(
      4
    );
    await navigateToWorkspacePage(page);
  });

  test('Notebook is listed', async () => {
    await page.waitForSelector('text=My notebook titlepad title here');
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex(
      (pad) => pad.name === 'My notebook titlepad title here'
    );

    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
  });

  test('It can duplicate a pad', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    await duplicatePad(page, padToCopyIndex);

    await page.waitForSelector('text=Copy of My notebook titlepad title here');
    const pads = await getPadList(page);
    padCopyIndex = pads.findIndex(
      (pad) =>
        pad.name.toLocaleLowerCase() ===
        'copy of my notebook titlepad title here'
    );

    expect(padCopyIndex).toBeGreaterThanOrEqual(0);
    await followPad(page, padCopyIndex);
    await waitForEditorToLoad(page);
    await expect(
      page
        .getByRole('heading', {
          name: 'Copy of My notebook titlepad title here',
        })
        .getByText('Copy of My notebook titlepad title here')
    ).toBeVisible();
    await expect(page.locator('[data-testid="paragraph-wrapper"]')).toHaveCount(
      4
    );
    await navigateToWorkspacePage(page);
  });

  test('Notebook is listed again', async () => {
    await page.waitForSelector('text=My notebook titlepad title here');
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex(
      (pad) => pad.name === 'Copy of My notebook titlepad title here'
    );

    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
  });

  test('Can export a notebook', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);

    expect(JSON.parse(await exportPad(page, padToCopyIndex))).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'Copy of My notebook titlepad title here',
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
