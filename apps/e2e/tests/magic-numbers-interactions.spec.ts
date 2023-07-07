import { BrowserContext, Page, test, expect } from '@playwright/test';
import notebookSource from '../__fixtures__/005-magic-numbers.json';
import {
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { createWorkspace, importNotebook } from '../utils/src';

test.describe('Testing magic numbers', () => {
  test.describe.configure({ mode: 'serial' });

  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    workspaceId = await createWorkspace(page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(JSON.stringify(notebookSource), 'utf-8').toString('base64'),
      page
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Waiting for editor to be ready', async () => {
    await navigateToNotebook(page, notebookId);
    await waitForEditorToLoad(page);
  });

  test('Checking if the "currently displayed elsewhere" text is shown', async () => {
    // Clicking Letter.Name
    await page.getByTestId('code-result:B').click();
    await page.getByTestId('unnamed-label').click();

    // Waiting for code line to load correctly
    await expect(page.getByTestId('code-line-result:B')).toBeVisible();

    await page.getByTestId('code-result:B').click();

    await expect(
      page.getByText(
        'This calculation is currently displayed elsewhere. Bring it back.'
      )
    ).toBeVisible();

    // Clicking lookup(Letters, Letter) twice to close the other menu and open the right one
    await page.getByTestId('code-result:B,2').click();
    await page.getByTestId('code-result:B,2').click();
    await expect(
      page.getByText(
        'This calculation is currently displayed elsewhere. Bring it back.'
      )
    ).toBeVisible();
  });

  test('Testing checkboxes', async () => {
    await page.getByTestId('code-result:false').click();
    await page.getByTestId('inline-formula-editor').click();
    await page
      .getByTestId('inline-formula-editor')
      .getByRole('textbox')
      .fill('true');
    await expect(page.getByTestId('code-result:true')).toBeVisible();
  });

  test('Testing unit change', async () => {
    await page.getByTestId('code-result:2042').click();
    await page
      .getByTestId('code-line-float')
      .getByTestId('unit-picker-button')
      .click();
    await page.getByText('Currency').click();
    await page.getByText('CAD').click();
    await expect(
      page.getByTestId('code-result:2042').getByText('$2,042')
    ).toBeVisible();
  });

  test('Testing changing variable name', async () => {
    await page.getByTestId('code-result:1234').click();
    await page.getByTestId('code-result:1234').click();
    await page
      .getByTestId('inline-formula-editor')
      .getByText('Advanced')
      .click();

    await page
      .getByTestId('inline-formula-editor')
      .getByText('Advanced')
      .fill('AdvancedChanged');

    // Unfocusing magic number menu
    await page.getByTestId('notebook-title').click();

    await page.getByText('AdvancedChanged').click();
  });
});
