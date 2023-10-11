import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';

test.describe('check help button options on notebook', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

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

  test('checks releses', async () => {
    await page.getByTestId('segment-button-trigger-top-bar-help').click();
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      await page.getByTestId('releases-link').click(),
    ]);
    expect(newPage.url()).toMatch(/.*\/docs\/releases/);
  });
  test('checks docs', async () => {
    await page.getByTestId('segment-button-trigger-top-bar-help').click();
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      await page.getByTestId('docs-link').click(),
    ]);
    expect(newPage.url()).toMatch(/.*\/docs/);
  });

  test('join discord link works', async () => {
    await page.getByTestId('segment-button-trigger-top-bar-help').click();
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      await page.getByTestId('discord-link').click(),
    ]);
    expect(newPage.url()).toMatch('https://discord.com/invite/decipad');
  });
});
