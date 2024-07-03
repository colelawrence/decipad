import { Timeouts } from '../utils/src/timeout';
import { expect, test } from './manager/decipad-tests';

test('page title is the same as notebook @browser @notebook', async ({
  randomFreeUser,
}) => {
  const { page, notebook } = randomFreeUser;
  const notebookTitle = 'My New Title';

  await test.step('initial page title is the same as new notebook', async () => {
    await randomFreeUser.createAndNavNewNotebook();
    await expect(page).toHaveTitle('Welcome to Decipad! | Decipad');
  });

  await test.step('page title changes when notebook title changes', async () => {
    await notebook.updateNotebookTitle(notebookTitle);
    await expect(page, "page title don't match pattern").toHaveTitle(
      `${notebookTitle} | Decipad`
    );
  });

  await test.step('check page title persists after going to workspace and back', async () => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.redirectDelay);
    await page.getByTestId('segment-button-trigger-back-to-home').click();
    await page.getByText(notebookTitle).first().click();
    await notebook.waitForEditorToLoad();
    await expect(page, "page title don't match pattern").toHaveTitle(
      `${notebookTitle} | Decipad`
    );
  });
});
