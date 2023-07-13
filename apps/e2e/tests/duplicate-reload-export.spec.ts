import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  editorTitleLocator,
  setUp,
  waitForEditorToLoad,
  editorLocator,
} from '../utils/page/Editor';
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
    await page.locator(editorTitleLocator()).first().fill('pad title here');

    await page
      .getByTestId('paragraph-content')
      .last()
      .fill('this is the first paragraph');

    await page
      .getByTestId('paragraph-content')
      .last()
      .fill('this is the second paragraph');

    await page
      .getByTestId('paragraph-content')
      .last()
      .fill('this is the third paragraph');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay * 2);
  });

  test('Can reload', async () => {
    await page.reload();
    await waitForEditorToLoad(page);
    await expect(page.locator(editorLocator())).toBeVisible();
    await navigateToWorkspacePage(page);
  });

  test('Check if notebook has 4 paragraphs', async () => {
    await page.getByText('pad title here').waitFor();
    await page.getByText('pad title here').click();
    await expect(page.getByText('this is the third paragraph')).toBeVisible();
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
    await navigateToWorkspacePage(page);
  });

  test('Notebook is listed', async () => {
    await page.getByText('pad title here').waitFor();
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex((pad) => pad.name === 'pad title here');
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
  });

  test('It can duplicate a pad', async () => {
    expect(padToCopyIndex).toBeGreaterThanOrEqual(0);
    await duplicatePad(page, padToCopyIndex);
    await page.getByText('Copy of pad title here').waitFor();
    const pads = await getPadList(page);
    padCopyIndex = pads.findIndex(
      (pad) => pad.name.toLocaleLowerCase() === 'copy of pad title here'
    );

    expect(padCopyIndex).toBeGreaterThanOrEqual(0);
    await followPad(page, padCopyIndex);
    await waitForEditorToLoad(page);
    await expect(
      page
        .getByRole('heading', {
          name: 'Copy of pad title here',
        })
        .getByText('Copy of pad title here')
    ).toBeVisible();
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
    await navigateToWorkspacePage(page);
  });

  test('Notebook is listed again', async () => {
    await page.getByText('pad title here').last().waitFor();
    const pads = await getPadList(page);
    padToCopyIndex = pads.findIndex(
      (pad) => pad.name === 'Copy of pad title here'
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
              text: 'Copy of pad title here',
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
