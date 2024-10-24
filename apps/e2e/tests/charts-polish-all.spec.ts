import charts from '../__fixtures__/012-charts.json';
import { Timeouts, snapshot } from '../utils/src';
import type { Page } from './manager/decipad-tests';
import { test } from './manager/decipad-tests';

test('Use case: charts screenshot @snapshot', async ({ testUser }) => {
  const { page } = testUser;
  await testUser.importNotebook(charts);
  await testUser.notebook.waitForEditorToLoad();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.chartsDelay + Timeouts.computerDelay);
  await snapshot(page as Page, 'Notebook: Chart polish check');
});
