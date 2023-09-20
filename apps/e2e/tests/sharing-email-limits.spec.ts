import { BrowserContext, Page, expect, test } from '@playwright/test';
import { focusOnBody, setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { Timeouts } from '../utils/src';

test.describe('[free account] notebook invite flow', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  let collaborators: number;
  let readers: number;
  let authors: number;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });
  test('invites 1 collaborator and 1 reader to a notebook', async () => {
    await focusOnBody(page);
    await page.getByTestId('publish-button').click();

    // invite collaborator
    await page
      .locator('.notebook-collaborate-tab input')
      .fill('invited-lama-1@ranch.org');
    await page.getByTestId('send-invitation').click();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('invited-lama-1@ranch.org')).toBeVisible();

    // invite reader
    await page.getByTestId('select-share-permission').click();
    await page.getByText('Notebook reader').click();
    await page
      .locator('.notebook-collaborate-tab input')
      .fill('invited-lama-2@ranch.org');
    await page.getByTestId('send-invitation').click();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('invited-lama-2@ranch.org')).toBeVisible();

    collaborators = await page
      .getByTestId(/^sharing-list:/)
      .getByText('collaborator')
      .count();
    expect(collaborators).toBe(1);
    readers = await page
      .getByTestId(/^sharing-list:/)
      .getByText('reader')
      .count();
    expect(readers).toBe(1);
    authors = await page.getByTestId('text-icon-button:author').count();
    expect(authors).toBe(1);

    await expect(page.getByTestId('upgrade-button')).toBeVisible();
  });

  test('change collaborator to reader', async () => {
    await page
      .getByTestId(/^sharing-list:/)
      .getByText('collaborator')
      .click();
    await page.getByText('Notebook reader').click();

    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    collaborators = await page
      .getByTestId(/^sharing-list:/)
      .getByText('collaborator')
      .count();
    expect(collaborators).toBe(0);
    readers = await page
      .getByTestId(/^sharing-list:/)
      .getByText('reader')
      .count();
    expect(readers).toBe(2);
    authors = await page.getByTestId('text-icon-button:author').count();
    expect(authors).toBe(1);
  });

  test('remove first reader from list', async () => {
    await page
      .getByTestId(/^sharing-list:/)
      .getByText('reader')
      .first()
      .click();
    await page.getByText('remove').click();

    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    collaborators = await page
      .getByTestId(/^sharing-list:/)
      .getByText('collaborator')
      .count();
    expect(collaborators).toBe(0);
    readers = await page
      .getByTestId(/^sharing-list:/)
      .getByText('reader')
      .count();
    expect(readers).toBe(1);
    authors = await page.getByTestId('text-icon-button:author').count();
    expect(authors).toBe(1);

    await expect(page.getByTestId('upgrade-button')).toBeHidden();
  });

  test('invite removed user back again as reader', async () => {
    await page
      .locator('.notebook-collaborate-tab input')
      .fill('invited-lama-1@ranch.org');
    await page.getByTestId('send-invitation').click();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('invited-lama-1@ranch.org')).toBeVisible();

    collaborators = await page
      .getByTestId(/^sharing-list:/)
      .getByText('collaborator')
      .count();
    expect(collaborators).toBe(0);
    readers = await page
      .getByTestId(/^sharing-list:/)
      .getByText('reader')
      .count();
    expect(readers).toBe(2);
    authors = await page.getByTestId('text-icon-button:author').count();
    expect(authors).toBe(1);

    await page.getByTestId('upgrade-button').click();
    expect(page.url()).toMatch(/\/w\/[^/]+/);
    await expect(page.getByTestId('upgrade-pro-modal')).toBeVisible();
  });
});
