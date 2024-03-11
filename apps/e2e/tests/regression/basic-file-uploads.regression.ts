import { Page, expect, test } from '../manager/decipad-tests';
import { Notebook } from '../manager/notebook';
import { Workspace } from '../manager/workspace';
import { AiAssistant } from '../manager/ai-assistant';
import { Timeouts } from '../../utils/src';

export async function deleteAllWorkspaceNotebooks(
  page: Page,
  workspace: Workspace
) {
  await expect(async () => {
    // archives notebooks until the workspace is empty
    if ((await page.getByText('No documents to list').count()) !== 1) {
      await workspace.archivePad(0);
    }
    await expect(page.getByText('No documents to list')).toBeVisible({
      timeout: 100,
    });
  }).toPass();
  await workspace.openArchive();

  // deleted notebooks from archive until the archive is empty
  await expect(async () => {
    if ((await page.getByText('No documents to list').count()) !== 1) {
      await workspace.deleteNotepad(0);
    }
    await expect(page.getByText('No documents to list')).toBeVisible({
      timeout: 100,
    });
  }).toPass();
}

test.describe('production regression checks', () => {
  let page: Page;
  let notebook: Notebook;
  let workspace: Workspace;
  let assistant: AiAssistant;

  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);

  test.beforeEach(async ({ browser }) => {
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
    assistant = new AiAssistant(page);
    await test.step('create new notebook for the test', async () => {
      // go to production
      await page.goto('https://app.decipad.com');

      await expect(page.getByText('Regression Testing').first()).toBeVisible();

      // if there are notebooks there from previous fails remove eveything
      deleteAllWorkspaceNotebooks(page, workspace);

      // go back to production (in case it went to the archive to reset the workspace)
      await page.goto('https://app.decipad.com');

      await workspace.clickNewPadButton();
      await assistant.closePannel();
      await notebook.updateNotebookTitle(notebookTitle);
    });
  });

  test.afterEach(async () => {
    await test.step('remove notebook from the test', async () => {
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.redirectDelay);
      await page.getByTestId('go-to-workspace').click();

      // restored an empty workspace for the next test
      deleteAllWorkspaceNotebooks(page, workspace);
    });
  });

  test('checks image uploads work', async () => {
    await test.step('Importing image through file explorer', async () => {
      await notebook.openImageUploader();
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByText('Choose file').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('./__fixtures__/images/download.png');
      await expect(
        page.getByTestId('notebook-image-block').locator('img')
      ).toBeVisible();
    });

    await test.step('delete image imported via file', async () => {
      await page.getByTestId('drag-handle').nth(1).click();
      await page.getByRole('menuitem', { name: 'Delete Delete' }).click();
      await expect(
        page.getByTestId('notebook-image-block').locator('img')
      ).toBeHidden();
    });
  });

  test('checks csv uploads work', async () => {
    await test.step('importing csv link through csv panel with link', async () => {
      await notebook.openCSVUploader();
      await page.getByRole('button', { name: 'Choose file' }).first().click();
      await page.getByTestId('link-file-tab').click();
      await page
        .getByTestId('upload-link-input')
        .fill(
          'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlmKKmOm0b22FcmTTiLy44qz8TPtSipfvnd1hBpucDISH4p02r3QuCKn3LIOe2UFxotVpYdbG8KBSf/pub?gid=0&single=true&output=csv'
        );
      await page.getByTestId('link-button').click();
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
  });
});
