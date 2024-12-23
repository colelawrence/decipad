import { expect, test } from './manager/decipad-tests';
import { Timeouts } from '../utils/src';
import notebookSource from '../__fixtures__/008-simple-inline-number-notebook.json';

test('Check references break', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await test.step('navigates to notebook and loads it', async () => {
    await testUser.importNotebook(notebookSource);
    await notebook.waitForEditorToLoad();
    await notebook.checkNotebookTitle('Check notebook references');
  });

  await test.step('deletes calculation to break inline results', async () => {
    await page.locator('article').getByTestId('drag-handle').nth(3).click();

    const hasCodelineErrors = page.getByTestId('code-line-warning');

    const cEC = await hasCodelineErrors.count();

    // there should be no errors
    expect.soft(cEC, `calculation errors`).toBe(0);

    await page.getByText('Delete').waitFor();
    await page.getByText('Delete').click();
  });

  await test.step('checks for errors', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);

    // note: This will stop picking up errors if we change the icon of errors
    const hasCodelineErrors = page.getByTestId('code-line-warning');

    const cEC = await hasCodelineErrors.count();

    // See if it has errors in calculations
    expect.soft(cEC, `calculation errors`).toBeGreaterThan(0);
  });
});
