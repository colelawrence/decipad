import type { Page } from '../manager/decipad-tests';
import { expect, test } from '../manager/decipad-tests';
import { Notebook } from '../manager/notebook';
import { Workspace } from '../manager/workspace';
import { Timeouts } from '../../utils/src';

test.describe.configure({ mode: 'serial' });

export async function deleteAllWorkspaceNotebooks(
  page: Page,
  workspace: Workspace
) {
  await expect(async () => {
    // archives notebooks until the workspace is empty
    if ((await page.getByText('No documents to list').count()) !== 1) {
      await workspace.archivePad(0);
    }
    await expect(page.getByText('No documents to list')).toBeVisible();
  }).toPass();
  await workspace.openArchive();

  // deleted notebooks from archive until the archive is empty
  await expect(async () => {
    if ((await page.getByText('No documents to list').count()) !== 1) {
      await workspace.deleteNotepad(0);
    }
    await expect(page.getByText('No documents to list')).toBeVisible();
  }).toPass();
}

test.describe('staging performance checks', () => {
  let page: Page;
  let notebook: Notebook;
  let workspace: Workspace;

  // get PR Number
  const deployName = process.env.DEPLOY_NAME;

  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);

  test('login', async ({ browser }) => {
    // get staging user agent string
    const userAgent = process.env.USER_AGENT_KEY;

    // Create a new browser context with the custom user agent
    const context = await browser.newContext({
      userAgent,
    });

    // Use the custom context to create a new page
    page = await context.newPage();

    notebook = new Notebook(page);
    workspace = new Workspace(page);
  });

  test('check workspace is empty', async ({}) => {
    await test.step('create new notebook for the test', async () => {
      // go to production
      await page.goto(`https://${deployName}.decipadstaging.com`);

      // if there are notebooks there from previous fails remove eveything
      await deleteAllWorkspaceNotebooks(page, workspace);
    });
  });

  test('load workspace', async ({ performance }) => {
    performance.sampleStart('Load Workspace');
    await page.goto(`https://${deployName}.decipadstaging.com`);
    await expect(page.getByText('Welcome to')).toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    performance.sampleEnd('Load Workspace');
    expect
      .soft(
        performance.getSampleTime('Load Workspace'),
        'Loading workspace took more than 10 seconds'
      )
      .toBeLessThanOrEqual(10000);
  });

  test('new notebook', async ({ performance }) => {
    performance.sampleStart('New Norwbook');
    await workspace.clickNewPadButton();
    await notebook.waitForEditorToLoad();
    performance.sampleEnd('New Norwbook');
    expect
      .soft(
        performance.getSampleTime('New Norwbook'),
        'Creating a Notebook took more than 5 seconds'
      )
      .toBeLessThanOrEqual(5000);
  });

  test('checks csv uploads work', async ({ performance }) => {
    await test.step('importing csv link through csv panel with link', async () => {
      await notebook.updateNotebookTitle(notebookTitle);
      await notebook.closeSidebar();
      await notebook.waitForEditorToLoad();
      await notebook.selectLastParagraph();

      await notebook.openCSVUploader();
      await page.getByTestId('link-file-tab').click();
      await page
        .getByPlaceholder('Paste the data link here')
        .fill(
          'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlmKKmOm0b22FcmTTiLy44qz8TPtSipfvnd1hBpucDISH4p02r3QuCKn3LIOe2UFxotVpYdbG8KBSf/pub?gid=0&single=true&output=csv'
        );

      await page.getByRole('button', { name: 'insert data' }).click();
      performance.sampleStart('Ingest CSV');
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page.getByTestId('live-code').getByTestId('loading-animation').first()
        ).toBeHidden();
      }).toPass({
        timeout: 1000,
      });
      await page
        .getByTestId('integration-block')
        .filter({ hasText: /Variable/ })
        .getByTestId('segment-button-trigger')
        .click();
      await expect(
        page.getByText('20 rows, previewing rows 1 to 10')
      ).toBeVisible();
    });
    performance.sampleEnd('Ingest CSV');
    expect
      .soft(
        performance.getSampleTime('Ingest CSV'),
        'CSV Ingest took more than 10 seconds'
      )
      .toBeLessThanOrEqual(10000);
  });

  test('leaves workspace clean', async ({}) => {
    await page.goto(`https://${deployName}.decipadstaging.com`);

    // restored an empty workspace for the next test
    await deleteAllWorkspaceNotebooks(page, workspace);

    page.close();
  });
});
