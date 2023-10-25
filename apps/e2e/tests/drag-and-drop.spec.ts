import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp } from '../utils/page/Editor';

test.describe('Section creation', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    // Search bar hidden under 1280
    page.setViewportSize({ width: 1300, height: 720 });
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: false,
        randomUser: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Creating a new section', async () => {
    await page.getByTestId('new-section-button').click();
    await page.getByPlaceholder('My section').fill('Drag and Drop Test');
    await page.getByRole('button', { name: 'Create Section' }).click();

    // Navigating back to My Notebooks
    await page.getByTestId('my-notebooks-button').click();
  });

  test('Searching on the search bar and dragging the notebook', async () => {
    await expect(async () => {
      await expect(page.getByTestId('workspace-hero-title')).toBeVisible();
    }).toPass();
    await page.getByTestId('search-bar').click();
    await page
      .getByTestId('search-bar')
      .pressSequentially('Welcome to Decipad!');

    // Dragging the notebook
    await page
      .getByTestId('notebook-list-item')
      .getByText('Welcome to Decipad!')
      .hover();
    await page.mouse.down();
    await page.getByText('Drag and Drop Test').hover();
    await page.mouse.up();
  });

  test('Checking if the right notebook was dragged into the section', async () => {
    await page
      .getByTestId('navigation-list-item')
      .getByText('Drag and Drop Test')
      .click();
    await expect(
      page.getByTestId('notebook-list-item').getByText('Welcome to Decipad!')
    ).toBeVisible();
  });

  test('Checking if the no search result warning banner is displayed', async () => {
    await expect(page.getByTestId('no-correct-search-result')).toBeHidden();
  });
});
