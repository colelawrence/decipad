import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';

test.describe('Notebook actions from within the notebook', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Changes the status of the notebook', async () => {
    const actions = page.getByTestId('notebook-actions');
    const notebookStatus = page.getByTestId('notebook-status');

    await expect(actions).toBeVisible();
    await expect(notebookStatus).toBeVisible();
    await expect(notebookStatus).toHaveText('Draft');

    await actions.click();

    const changeStatus = page.locator('text="Change Status"');

    await changeStatus.click();

    const review = page.locator('[role="menuitem"]:has-text("Review")');
    await review.click();

    // They hide after you click the review option.
    await expect(changeStatus).toBeHidden();
    await expect(review).toBeHidden();
    await expect(notebookStatus).toHaveText('review');
  });

  test('Change status again', async () => {
    const actions = page.getByTestId('notebook-actions');
    const notebookStatus = page.getByTestId('notebook-status');

    await expect(actions).toBeVisible();
    await expect(notebookStatus).toBeVisible();
    await expect(notebookStatus).toHaveText('review');

    await actions.click();

    const changeStatus = page.locator('text="Change Status"');

    await changeStatus.click();

    const review = page.locator('[role="menuitem"]:has-text("Done")');
    await review.click();

    // They hide after you click the review option.
    await expect(changeStatus).toBeHidden();
    await expect(review).toBeHidden();
    await expect(notebookStatus).toHaveText('done');
  });

  test('Can archive and unarchive notebook', async () => {
    const actions = page.getByTestId('notebook-actions');

    await actions.click();
    const archive = page.locator('[role="menuitem"]:has-text("Archive")');

    await archive.click();

    const archiveMessage = page.locator(
      'text="Successfully archived notebook."'
    );
    await expect(archiveMessage).toBeVisible();

    await actions.click();

    const putBack = page.locator('[role="menuitem"]:has-text("Put back")');
    await expect(putBack).toBeVisible();
    await expect(archive).toBeHidden();
    await putBack.click();

    await actions.click();
    await expect(putBack).toBeHidden();
    await expect(archive).toBeVisible();
    // Make sure to close it!
    await page.mouse.click(0, 0);
  });

  test('Can download notebook', async () => {
    const actions = page.getByTestId('notebook-actions');

    await actions.click();
    const download = page.locator('[role="menuitem"]:has-text("Download")');

    const downloadPromise = page.waitForEvent('download');
    await download.click();
    const notebookFile = await downloadPromise;
    const err = await notebookFile.failure();
    expect(err).toBeNull();
  });
});
