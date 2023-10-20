import { BrowserContext, Page, expect, test } from '@playwright/test';
import stringify from 'json-stringify-safe';
import notebookSource from '../__fixtures__/001-notebook.json';
import {
  editorTitleLocator,
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
  waitForNotebookToLoad,
} from '../utils/page/Editor';
import {
  Timeouts,
  createWorkspace,
  importNotebook,
  snapshot,
  withTestUser,
} from '../utils/src';
import waitForExpect from 'wait-for-expect';

test.describe('Loading and snapshot of big notebook', () => {
  test.describe.configure({ mode: 'serial' });

  let publishedNotebookPage: Page;
  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  let context: BrowserContext;
  let incognito: BrowserContext;
  let randomUser: BrowserContext;
  let localStorageValue: string | null;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    incognito = await browser.newContext();
    randomUser = await browser.newContext();

    await setUp({ page, context });
    workspaceId = await createWorkspace(page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(stringify(notebookSource), 'utf-8').toString('base64'),
      page
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('navigates to notebook and loads it', async () => {
    await navigateToNotebook(page, notebookId);
    // some time for the notebook to render
    await waitForEditorToLoad(page);
    // eslint-disable-next-line playwright/valid-expect
    await expect(page.locator(editorTitleLocator())).toHaveText(
      'Everything, everywhere, all at once'
    );
    await page.waitForSelector('text="ם עוד. על בקר"');

    await snapshot(page as Page, 'Notebook: All elements');
  });

  test.use({ colorScheme: 'dark' });

  test('shows workspace in dark mode mode', async () => {
    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'dark');
        return window.localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('dark');
      }
    });
    await page.reload({ waitUntil: 'load' });
    await snapshot(page as Page, 'Notebook: All elements Darkmode');
  });

  test.use({ colorScheme: 'light' });

  test('shows workspace in light mode mode', async () => {
    // eslint-disable-next-line playwright/valid-expect
    await waitForExpect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'light');
        return localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('light');
      }
    });
    await page.reload({ waitUntil: 'load' });
  });

  test('click publish button and extract text', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'Share' }).click();
    await page.getByTestId('publish-tab').click();
    await page.locator('[aria-roledescription="enable publishing"]').click();
    await page.getByTestId('copy-published-link').waitFor();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(page as Page, 'Notebook: Publish Popover');
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('navigates to published notebook link', async () => {
    await page.getByTestId('copy-published-link').waitFor();

    publishedNotebookPage = await randomUser.newPage();

    await withTestUser({ context: randomUser, page: publishedNotebookPage });

    await navigateToNotebook(publishedNotebookPage, notebookId);

    await waitForNotebookToLoad(publishedNotebookPage);

    await publishedNotebookPage.waitForSelector('text="ם עוד. על בקר"');
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('a random user can duplicate', async () => {
    await publishedNotebookPage.click('text=Duplicate notebook');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(2_000);

    await waitForNotebookToLoad(publishedNotebookPage);
    await publishedNotebookPage.waitForSelector('text="ם עוד. על בקר"');

    await expect(page.locator('[data-testid="paragraph-wrapper"]')).toHaveCount(
      24
    );
    await expect(page.locator('[data-slate-editor] p')).toHaveCount(9);
  });

  // TODO: ENG-1891 fix this test
  // eslint-disable-next-line playwright/no-skipped-test
  test('navigates to published notebook link incognito', async () => {
    publishedNotebookPage = (await incognito.newPage()) as Page;

    await navigateToNotebook(publishedNotebookPage, notebookId);
    await waitForNotebookToLoad(publishedNotebookPage);
    // make sure screenshot is captured
    expect(publishedNotebookPage).toBeDefined();

    // Magic numbers are delayed
    await page.getByText('This is a string').first().waitFor();
    await page.getByText('ם עוד. על בקר').first().waitFor();

    // wait for charts to load before snapshot
    await page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(
      publishedNotebookPage,
      'Notebook: Published mode (incognito)',
      {
        mobile: true,
      }
    );
  });
});
