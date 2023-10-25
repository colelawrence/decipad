import { expect, Page, test } from '@playwright/test';
import notebookSource from '../__fixtures__/006-notebook-formula-tables.json';
import { navigateToNotebook, waitForEditorToLoad } from '../utils/page/Editor';
import { createWorkspace, importNotebook } from '../utils/src';

export const typeTest = (currentPage: Page, input: string) =>
  test.step('Trying to add text to formulas', async () => {
    await currentPage.getByTestId('code-line').fill(input);
  });

test.describe('Testing tables created from formulas', () => {
  test.describe.configure({ mode: 'serial' });

  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    workspaceId = await createWorkspace(page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(JSON.stringify(notebookSource), 'utf-8').toString('base64'),
      page
    );
    await navigateToNotebook(page, notebookId);
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Filling in the code and testing that the numbers are displayed properly', async () => {
    // This test will fail if topological sort is not working properly
    // Failing behavior:
    // +------+--------+
    // | Name | Values |
    // +------+--------+
    // | A    | 1      |
    // +------+--------+
    // | B    | 2      |
    // +------+--------+
    // | C    | 3      |
    // +------+--------+
    // | D    | 1      |
    // +------+--------+

    await page.getByTestId('code-line').click();
    await page
      .getByTestId('code-line')
      .fill(
        'Table = {Name = ["A", "B", "C", "D"] \n Values = [Unnamed1, Unnamed2, Unnamed3, Unnamed4]}'
      );
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:A')
        .getByText('A')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:B')
        .getByText('B')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:C')
        .getByText('C')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('text-result:D')
        .getByText('D')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:1')
        .getByText('1')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:2')
        .getByText('2')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:3')
        .getByText('3')
    ).toBeVisible();
    await expect(
      page
        .getByTestId('editor-table')
        .getByTestId('number-result:4')
        .getByText('4')
    ).toBeVisible();
  });
});
