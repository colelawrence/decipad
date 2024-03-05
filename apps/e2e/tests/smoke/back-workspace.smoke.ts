import { expect, test as smoketest } from '../manager/decipad-tests';
/* eslint-disable playwright/no-standalone-expect */
smoketest(
  'create notebook and go back to workspace',
  async ({ randomFreeUser }) => {
    // check if at any moment we got an error page
    await randomFreeUser.page.addLocatorHandler(
      randomFreeUser.page.getByText('Sorry, we did something wrong'),
      async () => {
        await expect(
          randomFreeUser.page.getByText('Sorry, we did something wrong'),
          'An error page was shown during the navigation process'
        ).toBeHidden();
        smoketest.fail();
      }
    );
    await randomFreeUser.createNewNotebook();
    await randomFreeUser.notebook.waitForEditorToLoad();
    await randomFreeUser.page.getByTestId('go-to-workspace').click();
    await expect(randomFreeUser.workspace.newNotebook).toBeVisible();
  }
);
