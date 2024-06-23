/* eslint-disable playwright/no-wait-for-selector */
/* eslint-disable playwright/valid-describe-callback */
/* eslint-disable playwright/no-conditional-expect */
import type { Page } from './manager/decipad-tests';
import { expect, test } from './manager/decipad-tests';
import notebookSource from '../__fixtures__/001-notebook.json';
import { Timeouts, snapshot } from '../utils/src';

const waitForPageLoad = async (page: Page) =>
  Promise.all([
    page.getByTestId('number-result:454534534534534535345340').nth(0).waitFor(),
    page.waitForSelector('text="ם עוד. על בקר"'),
    await page.getByText('≈1,491.43 weeks').first().waitFor(),
    await page.getByText('≈1,594.29 weeks').first().waitFor(),
  ]);

test.use({ colorScheme: 'dark' });
test('Loading and snapshot of big notebook darkmode', async ({ testUser }) => {
  let notebookId: string;
  let localStorageValue: string | null;

  test.slow();

  await test.step('setup notebook', async () => {
    notebookId = await testUser.importNotebook(
      notebookSource,
      testUser.workspace.baseWorkspaceID
    );
    await testUser.notebook.waitForEditorToLoad();
  });

  await test.step('navigates to notebook and loads it', async () => {
    await testUser.navigateToNotebook(notebookId);
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
test('Loading and snapshot of big notebook', async ({
  testUser,
  anotherRandomFreeUser,
  unregisteredUser,
}) => {
  let notebookId: string;
  let publishedNotebookURL: string;
  let localStorageValue: string | null;
  test.slow();

  await test.step('setup notebook', async () => {
    notebookId = await testUser.importNotebook(
      notebookSource,
      testUser.workspace.baseWorkspaceID
    );
    await testUser.notebook.waitForEditorToLoad();
  });

  await test.step('navigates to notebook and loads it', async () => {
    await testUser.navigateToNotebook(notebookId);
    await testUser.notebook.waitForEditorToLoad();
    await waitForPageLoad(testUser.page);
    await testUser.notebook.checkNotebookTitle(
      'Everything, everywhere, all at once'
    );
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
    publishedNotebookURL = await testUser.notebook.publishNotebook();
    await snapshot(testUser.page, 'Notebook: Publish Popover');
  });

  await test.step('navigates to published notebook link', async () => {
    await anotherRandomFreeUser.page.goto(publishedNotebookURL);
    await anotherRandomFreeUser.notebook.waitForEditorToLoad();
    await waitForPageLoad(anotherRandomFreeUser.page);
  });

  await test.step('a random user can duplicate', async () => {
    await anotherRandomFreeUser.notebook.topRightDuplicateNotebook.click();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await anotherRandomFreeUser.page.waitForTimeout(2_000);

    await anotherRandomFreeUser.notebook.waitForEditorToLoad();
    await waitForPageLoad(anotherRandomFreeUser.page);

    await expect(
      testUser.page.locator('[data-testid="paragraph-wrapper"]')
    ).toHaveCount(24);
    await expect(testUser.page.locator('[data-slate-editor] p')).toHaveCount(9);
  });

  await test.step('navigates to published notebook link incognito', async () => {
    await unregisteredUser.navigateToNotebook(notebookId);
    await unregisteredUser.notebook.waitForEditorToLoad();
    // make sure screenshot is captured
    expect(unregisteredUser.page).toBeDefined();

    // Magic numbers are delayed
    await unregisteredUser.page.getByText('This is a string').first().waitFor();
    await unregisteredUser.page.getByText('ם עוד. על בקר').first().waitFor();

    // wait for charts to load before snapshot
    await unregisteredUser.page.isVisible('[data-testid="chart-styles"]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await unregisteredUser.page.waitForTimeout(Timeouts.chartsDelay);

    // waits for information on dataviews to be shown
    await expect(
      unregisteredUser.page
        .locator('th')
        .filter({ hasText: 'Mar' })
        .locator('span')
    ).toBeVisible();

    await snapshot(
      unregisteredUser.page,
      'Notebook: Published mode (incognito)',
      {
        mobile: true,
      }
    );
  });

  await test.step('error page', async () => {
    await unregisteredUser.page.goto(`/dfsfdfsdf`);

    await unregisteredUser.page
      .getByText('The requested URL was not found')
      .isVisible();
    await snapshot(unregisteredUser.page, 'Decipad: Error Page', {
      mobile: true,
    });
  });
});
