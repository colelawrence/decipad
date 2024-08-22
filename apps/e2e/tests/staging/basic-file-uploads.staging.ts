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

  const deployName = process.env.DEPLOY_NAME;
  const stagingURL =
    deployName === 'dev'
      ? 'https://dev.decipad.com'
      : `https://${deployName}.decipadstaging.com`;

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
    performance.sampleStart('New Notebook');
    await workspace.clickNewPadButton();
    await notebook.waitForEditorToLoad();
    performance.sampleEnd('New Notebook');
    expect
      .soft(
        performance.getSampleTime('New Notebook'),
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

      performance.sampleStart('Ingest CSV');

      await notebook.addCSV({
        method: 'link',
        link: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmIzE6QNJNDoKEaJebXmLNhXZEDxjUyod2FSx_mwgHk1tfjMuPhQmUCd2qNRv8ceWOZMOBJUlzeOLP/pub?output=csv',
        varName: 'Customers',
      });

      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page.getByTestId('live-code').getByTestId('loading-animation').first()
        ).toBeHidden();
      }).toPass({
        timeout: 1000,
      });
      await expect(
        page.getByText('10000 rows, previewing rows 1 to 10')
      ).toBeVisible();
    });
    performance.sampleEnd('Ingest CSV');
    expect
      .soft(
        performance.getSampleTime('Ingest CSV'),
        'CSV Ingest took more than 50 seconds'
      )
      .toBeLessThanOrEqual(50_000);
  });

  test('text formatter with mouse', async ({}) => {
    await notebook.focusOnBody();
    await notebook.selectLastParagraph();
    await expect(
      page.getByText('10000 rows, previewing rows 1 to 10')
    ).toBeVisible();
    await expect(
      page
        .getByRole('textbox')
        .locator('div')
        .filter({ hasText: 'Customers' })
        .first()
    ).toBeVisible();
    await page.keyboard.type('this is the content for the first paragraph');
    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      'this is the content for the first paragraph'
    );

    // text that will be selected by the mouse
    const p = page.getByText('for the first par');

    // Get the bounding box of the paragraph
    const box = await p.boundingBox();

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (box) {
      // Calculate positions for the selection
      const startX = box.x + 130; // approximate position before "for"
      const startY = box.y + box.height / 2;
      const endX = box.x + 230; // approximate position after "the first"
      const endY = startY;

      // Simulate mouse actions to select "for the first"
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY);
      await page.mouse.up();
    } else {
      throw new Error('Failed to retrieve bounding box for the paragraph');
    }

    // checks the actual text style.
    const beforeTextStyles = await p.evaluate((element) => [
      window.getComputedStyle(element).getPropertyValue('font-weight'),
      window.getComputedStyle(element).getPropertyValue('font-style'),
    ]);

    await page.click('button:has-text("Bold")');
    await page.click('button:has-text("Italic")');

    // checks the actual text style.
    const textStyles = await p.evaluate((element) => [
      window.getComputedStyle(element).getPropertyValue('font-weight'),
      window.getComputedStyle(element).getPropertyValue('font-style'),
    ]);

    // compare the before styles with the current styles.
    expect(textStyles[0] > beforeTextStyles[0]).toBe(true);
    expect(textStyles[1] !== beforeTextStyles[1]).toBe(true);
  });

  test('creates a data view', async ({ performance }) => {
    performance.sampleStart('Adding Data View');
    await page.getByText('Pivot view').click();

    await expect(page.getByText(/Data/)).toBeVisible();
    performance.sampleEnd('Adding Data View');
    expect
      .soft(
        performance.getSampleTime('Adding Data View'),
        'Adding Data View took more than 15 seconds'
      )
      .toBeLessThanOrEqual(15_000);

    await notebook.checkCalculationErrors();

    performance.sampleStart('Add Data View Column');
    await expect(page.getByTestId('add-data-view-column-button')).toBeVisible();
    await page.getByTestId('add-data-view-column-button').click();
    await page.getByRole('menuitem', { name: 'Country' }).click();
    await expect(async () => {
      await expect(page.getByText('Page 1 of 5')).toBeVisible();
    }).toPass();
    performance.sampleEnd('Add Data View Column');
    expect
      .soft(
        performance.getSampleTime('Add Data View Column'),
        'Adding Data View Column took more than 30 seconds'
      )
      .toBeLessThanOrEqual(40_000);

    /*
    Data views for 10k rows don't work well still, this will be the next step

    await test.step('importing csv link through csv panel with link', async () => {
      performance.sampleStart('Aggregation Data View');
      await page.getByTestId('data-view-options-menu-Country').click();
      await page.getByRole('menuitem', { name: 'Aggregate' }).click();
      await page.getByRole('menuitem', { name: 'Count values' }).click();
      await expect(page.getByText('10K')).toBeVisible();
      performance.sampleEnd('Aggregation Data View');
      expect
        .soft(
          performance.getSampleTime('Aggregation Data View'),
          'Data View Aggregation took more than 10 seconds'
        )
        .toBeLessThanOrEqual(10_000);
    });
*/
    await notebook.checkCalculationErrors();
  });

  test('leaves workspace clean', async ({}) => {
    await page.goto(stagingURL);

    // restored an empty workspace for the next test
    await deleteAllWorkspaceNotebooks(page, workspace);

    await page.close();
  });
});
