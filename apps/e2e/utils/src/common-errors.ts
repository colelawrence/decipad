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
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    const hasCodelineErrors = await page.getByTestId('code-line-warning');

    const hasErrorBlock = await page.getByTestId('error-block');

    const isLoading = await page.getByTestId('loading-results');

    const cEC = await hasCodelineErrors.count();
    const bEC = await hasErrorBlock.count();
    const lEC = await isLoading.count();

    // See if it has errors in calculations
    expect.soft(cEC, `calculation errors`).toBe(0);

    // See if it has error blocks
    expect.soft(bEC, `broken blocks`).toBe(0);

    // See if it has results that didn't load or magic errors
    expect.soft(lEC, `broken blocks`).toBe(0);
  });
