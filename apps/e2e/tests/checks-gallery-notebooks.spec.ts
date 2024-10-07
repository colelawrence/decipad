import fs from 'fs';
import path from 'path';
import { test } from './manager/decipad-tests';
import { timeout } from '@decipad/utils';
import { Timeouts } from '../utils/src';

const matcher = process.env.SELECT_NOTEBOOK || '';

const filesPath = path.join(__dirname, '..', '__fixtures__', 'gallery');
const files = fs.readdirSync(filesPath);
const jsonFiles = files
  .filter((file) => file.endsWith('.json'))
  .filter((file) => file.includes(matcher));

for (const file of jsonFiles) {
  test(`Check gallery template: ${file}`, async ({ randomFreeUser }) => {
    test.slow();
    await randomFreeUser.goToWorkspace();

    await test.step(`Load Notebook "${file}"`, async () => {
      const filePath = path.join(filesPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const source = JSON.parse(fileContent);

      await randomFreeUser.importNotebook(source);
      await randomFreeUser.notebook.waitForEditorToLoad();
    });

    await test.step('Check notebook tabs', async () => {
      const authorNotebookTabs = await randomFreeUser.notebook.getTabNames();

      for (const tab of authorNotebookTabs) {
        await randomFreeUser.notebook.selectTab(tab);
        await randomFreeUser.notebook.waitForEditorToLoad();
        await randomFreeUser.notebook.focusOnBody();
        await timeout(Timeouts.computerDelay);
        await randomFreeUser.notebook.checkCalculationErrors();
      }
    });
  });
}
