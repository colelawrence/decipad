import polish from '../__fixtures__/007-polish.json';
import { Timeouts, snapshot } from '../utils/src';
import type { Page } from './manager/decipad-tests';
import { test } from './manager/decipad-tests';

test('Use case: polish screenshot', async ({ testUser }) => {
  const { page } = testUser;
  await testUser.importNotebook(polish);
  await testUser.notebook.waitForEditorToLoad();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.chartsDelay + Timeouts.computerDelay);
  await page.getByTestId('unit-picker-button').click();
  await snapshot(page as Page, 'Notebook: Polish check');
});
