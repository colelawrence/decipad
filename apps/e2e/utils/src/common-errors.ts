import { expect, Page, test } from '@playwright/test';
import { Timeouts } from '.';
import {
  getPadName,
  navigateToNotebook,
  waitForEditorToLoad,
} from '../page/Editor';

export const navigateToNotebookPageStep = (
  page: Page,
  notebookId: string,
  notebookTitle?: string
) =>
  test.step(`Navigates to ${notebookId} (${notebookTitle}) notebook and loads it`, async () => {
    await navigateToNotebook(page, notebookId);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    // some time for the notebook to render
    await waitForEditorToLoad(page);
    expect(await getPadName(page)).toContain('[Template]');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
  });

export const checkForErrorsStep = (
  page: Page,
  notebookId: string,
  notebookTitle?: string
) =>
  test.step(`Check errors on ${notebookId} (${notebookTitle})`, async () => {
    // note: This will stop picking up errors if we change the icon of loading
    const hasMagicErrors = await page.locator(
      'p span >svg title:has-text("Loading")'
    );

    // note: This will stop picking up errors if we change the icon of errors
    const hasCodelineErrors = await page.locator(
      'output span >svg title:has-text("Warning")'
    );

    // note: This will stop picking up errors if we change the text of an error block
    const hasErrorBlock = await page.locator('text=Delete this block');

    const isLoading = await page.locator('[data-testid="loading-results"]');

    const mEC = await hasMagicErrors.count();
    const cEC = await hasCodelineErrors.count();
    const bEC = await hasErrorBlock.count();
    const lEC = await isLoading.count();

    // See if it has magic errors
    expect.soft(mEC, `magic errors`).toBe(0);

    // See if it has errors in calculations
    expect.soft(cEC, `calculation errors`).toBe(0);

    // See if it has error blocks
    expect.soft(bEC, `broken blocks`).toBe(0);

    // See if it has results that didn't load
    expect.soft(lEC, `broken blocks`).toBe(0);
  });
