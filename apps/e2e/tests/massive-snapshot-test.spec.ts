import { BrowserContext, Page, expect, test } from './manager/decipad-tests';
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

const waitForPageLoad = async (page: Page) =>
  Promise.all([
    page.getByTestId('number-result:454534534534534510149632').nth(0).waitFor(),
    page.waitForSelector('text="ם עוד. על בקר"'),
  ]);

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
    await expect(page.locator(editorTitleLocator())).toHaveText(
      'Everything, everywhere, all at once'
    );
    await waitForPageLoad(page);

    await snapshot(page as Page, 'Notebook: All elements');
  });

  test.use({ colorScheme: 'dark' });

  test('shows workspace in dark mode mode', async () => {
    await expect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'dark');
        return window.localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('dark');
      }
    }).toPass();
    await page.reload({ waitUntil: 'load' });
    await waitForPageLoad(page);
    await snapshot(page as Page, 'Notebook: All elements Darkmode');
  });

  test.use({ colorScheme: 'light' });

  test('shows workspace in light mode mode', async () => {
    await expect(async () => {
      localStorageValue = await page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'light');
        return localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('light');
      }
    }).toPass();
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

  test('navigates to published notebook link', async () => {
    await page.getByTestId('copy-published-link').waitFor();

    publishedNotebookPage = await randomUser.newPage();

    await withTestUser({ context: randomUser, page: publishedNotebookPage });

    await navigateToNotebook(publishedNotebookPage, notebookId);

    await waitForNotebookToLoad(publishedNotebookPage);

    await waitForPageLoad(publishedNotebookPage);
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test('a random user can duplicate', async () => {
    await publishedNotebookPage.click('text=Duplicate notebook');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(2_000);

    await waitForNotebookToLoad(publishedNotebookPage);
    await waitForPageLoad(publishedNotebookPage);

    await expect(page.locator('[data-testid="paragraph-wrapper"]')).toHaveCount(
      24
    );
    await expect(page.locator('[data-slate-editor] p')).toHaveCount(9);
  });

  test('navigates to published notebook link incognito', async () => {
    incognito.clearCookies();
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

    // waits for information on dataviews to be shown
    await expect(
      page.locator('th').filter({ hasText: 'Mar' }).locator('span')
    ).toBeVisible();

    await snapshot(
      publishedNotebookPage,
      'Notebook: Published mode (incognito)',
      {
        mobile: true,
      }
    );
  });
});
