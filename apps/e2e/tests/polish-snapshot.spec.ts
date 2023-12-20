import { test, Page } from './manager/decipad-tests';
import polish from '../__fixtures__/007-polish.json';
import { Timeouts, snapshot } from '../utils/src';

test('Use case: building a candle business', async ({ testUser }) => {
  const { page } = testUser;
  await testUser.importNotebook(polish);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.chartsDelay + Timeouts.computerDelay);
  await page.getByTestId('unit-picker-button').click();
  await snapshot(page as Page, 'Notebook: Polish check');
});
