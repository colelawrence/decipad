import { BrowserContext, Page, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { setUp } from '../utils/page/Editor';
import {
  checkForErrorsStep,
  createWorkspace,
  importNotebook,
  navigateToNotebookPageStep,
} from '../utils/src';

const matcher = process.env.SELECT_NOTEBOOK || '';

const files = fs.readdirSync(
  path.join(__dirname, '..', '__fixtures__', 'gallery')
);
const jsonFiles = files
  .filter((file) => file.endsWith('.json'))
  .filter((file) => file.includes(matcher));

for (const file of jsonFiles) {
  test.describe(`Check gallery template: ${file}`, () => {
    test.describe.configure({ mode: 'serial' });

    let workspaceId: string;
    let page: Page;
    let context: BrowserContext;
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      context = page.context();

      await setUp(
        { page, context },
        {
          createAndNavigateToNewPad: false,
        }
      );
      workspaceId = await createWorkspace(page);
    });

    test.afterAll(async () => {
      await page.close();
    });

    test('check notebook', async () => {
      const filePath = path.join(
        __dirname,
        '..',
        '__fixtures__',
        'gallery',
        file
      );
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const notebookId = await importNotebook(
        workspaceId,
        Buffer.from(fileContent, 'utf-8').toString('base64'),
        page
      );
      await navigateToNotebookPageStep(page, notebookId, file);
      await checkForErrorsStep(page, notebookId, file);
    });
  });
}
