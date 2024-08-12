import type { Page } from '../manager/decipad-tests';
import { expect, test } from '../manager/decipad-tests';
import { Notebook } from '../manager/notebook';
import { Workspace } from '../manager/workspace';

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

test.describe('sidebar opens for each new notebook', () => {
  let page: Page;
  let notebook: Notebook;
  let workspace: Workspace;

  const deployName = process.env.DEPLOY_NAME;
  const stagingURL =
    deployName === 'dev'
      ? 'https://dev.decipad.com'
      : `https://${deployName}.decipadstaging.com`;

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
      await page.goto(stagingURL);

      // if there are notebooks there from previous fails remove eveything
      await deleteAllWorkspaceNotebooks(page, workspace);
    });
  });

  test('load workspace', async ({ performance }) => {
    performance.sampleStart('Load Workspace');
    await page.goto(stagingURL);
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
  test('check sidebar', async ({}) => {
    const e2eFlags = {
      NAV_SIDEBAR: false,
    };
    const flags = JSON.stringify(e2eFlags);

    await page.evaluate(
      (f) => localStorage.setItem('deciFeatureFlags', f),
      flags
    );

    await page.reload();

    await notebook.returnToWorkspace();
    await workspace.createNewNotebook();

    // check the sidebar opens the first time
    await expect(page.getByTestId('editor-sidebar')).toBeVisible();
    await expect(page.getByPlaceholder('Search for blocks...')).toBeVisible();

    await notebook.returnToWorkspace();
    await workspace.createNewNotebook();

    // checks the sidebar opens a scond time time
    await expect(
      page.getByTestId('editor-sidebar'),
      "the sidebar didn't open by default as it should when you create a second notebook"
    ).toBeVisible();
    await expect(page.getByPlaceholder('Search for blocks...')).toBeVisible();
  });

  test('leaves workspace clean', async ({}) => {
    await page.goto(stagingURL);

    // restored an empty workspace for the next test
    await deleteAllWorkspaceNotebooks(page, workspace);

    await page.close();
  });
});
