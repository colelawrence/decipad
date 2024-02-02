/* eslint-disable playwright/no-wait-for-selector */
import { Page, expect, test } from './manager/decipad-tests';
import stringify from 'json-stringify-safe';
import notebookSource from '../__fixtures__/001-notebook.json';
import { waitForNotebookToLoad } from '../utils/page/Editor';
import {
  Timeouts,
  createWorkspace,
  importNotebook,
  snapshot,
} from '../utils/src';

const waitForPageLoad = async (page: Page) =>
  Promise.all([
    page.getByTestId('number-result:454534534534534510149632').nth(0).waitFor(),
    page.waitForSelector('text="ם עוד. על בקר"'),
  ]);

test.use({ colorScheme: 'dark' });
test('Loading and snapshot of big notebook darkmode', async ({ testUser }) => {
  let notebookId: string;
  let workspaceId: string;
  let localStorageValue: string | null;

  test.slow();

  await test.step('setup notebook', async () => {
    workspaceId = await createWorkspace(testUser.page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(stringify(notebookSource), 'utf-8').toString('base64'),
      testUser.page
    );
  });

  await test.step('navigates to notebook and loads it', async () => {
    await testUser.navigateToNotebook(notebookId);
    // some time for the notebook to render
    await testUser.notebook.waitForEditorToLoad();
    await testUser.notebook.checkNotebookTitle(
      'Everything, everywhere, all at once'
    );

    await testUser.notebook.waitForEditorToLoad();

    await snapshot(testUser.page, 'Notebook: All elements');
  });

  await test.step('shows workspace in dark mode mode', async () => {
    await expect(async () => {
      localStorageValue = await testUser.page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'dark');
        return window.localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('dark');
      }
    }).toPass();
    await testUser.page.reload({ waitUntil: 'load' });
    await waitForPageLoad(testUser.page);
    await snapshot(testUser.page, 'Notebook: All elements Darkmode');
  });
});

test.use({ colorScheme: 'light' });
test('Loading and snapshot of big notebook', async ({ testUser }) => {
  let notebookId: string;
  let workspaceId: string;
  let localStorageValue: string | null;
  test.slow();

  await test.step('setup notebook', async () => {
    workspaceId = await createWorkspace(testUser.page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(stringify(notebookSource), 'utf-8').toString('base64'),
      testUser.page
    );
  });

  await test.step('navigates to notebook and loads it', async () => {
    testUser.navigateToNotebook(notebookId);
    // some time for the notebook to render
    testUser.notebook.waitForEditorToLoad();
    await waitForPageLoad(testUser.page);
    testUser.notebook.checkNotebookTitle('Everything, everywhere, all at once');
    await waitForPageLoad(testUser.page);

    await snapshot(testUser.page, 'Notebook: All elements');
  });

  await test.step('shows workspace in light mode mode', async () => {
    await expect(async () => {
      localStorageValue = await testUser.page.evaluate(() => {
        window.localStorage.setItem('deciThemePreference', 'light');
        return localStorage.getItem('deciThemePreference');
      });

      if (localStorageValue !== null) {
        expect(localStorageValue).toMatch('light');
      }
    }).toPass();
  });

  await test.step('click publish button and extract text', async () => {
    await testUser.page.getByRole('button', { name: 'Share' }).click();
    await testUser.page.getByTestId('publish-tab').click();
    await testUser.page.getByTestId('publish-dropdown').click();
    await testUser.page.getByTestId('publish-public').click();
    await testUser.page.getByTestId('publish-changes').click();

    await testUser.page.getByTestId('copy-published-link').waitFor();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.chartsDelay);
    await snapshot(testUser.page, 'Notebook: Publish Popover');
  });

  await test.step('navigates to published notebook link', async () => {
    await testUser.page.getByTestId('copy-published-link').waitFor();

    await testUser.testWithNewUser();
    await testUser.navigateToNotebook(notebookId);
    await testUser.notebook.waitForEditorToLoad();
    await waitForPageLoad(testUser.page);
  });

  // eslint-disable-next-line playwright/no-skipped-test
  await test.step('a random user can duplicate', async () => {
    await testUser.page.click('text=Duplicate notebook');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(2_000);

    await waitForNotebookToLoad(testUser.page);
    await waitForPageLoad(testUser.page);

    await expect(
      testUser.page.locator('[data-testid="paragraph-wrapper"]')
    ).toHaveCount(24);
    await expect(testUser.page.locator('[data-slate-editor] p')).toHaveCount(9);
  });

  await test.step('navigates to published notebook link incognito', async () => {
    await testUser.context.clearCookies();
    await testUser.testWithoutUser();

    await testUser.navigateToNotebook(notebookId);
    await testUser.notebook.waitForEditorToLoad();
    // make sure screenshot is captured
    expect(testUser.page).toBeDefined();

    // Magic numbers are delayed
    await testUser.page.getByText('This is a string').first().waitFor();
    await testUser.page.getByText('ם עוד. על בקר').first().waitFor();

    // wait for charts to load before snapshot
    await testUser.page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await testUser.page.waitForTimeout(Timeouts.chartsDelay);

    // waits for information on dataviews to be shown
    await expect(
      testUser.page.locator('th').filter({ hasText: 'Mar' }).locator('span')
    ).toBeVisible();

    await snapshot(testUser.page, 'Notebook: Published mode (incognito)', {
      mobile: true,
    });
  });

  await test.step('error page', async () => {
    await testUser.testWithoutUser();
    await testUser.page.goto(`/dfsfdfsdf`);

    // Magic numbers are delayed
    await testUser.page
      .getByText('The requested URL was not found')
      .isVisible();
    await snapshot(testUser.page, 'Decipad: Error Page', {
      mobile: true,
    });
  });
});
