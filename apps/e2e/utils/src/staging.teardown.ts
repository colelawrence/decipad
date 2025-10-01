import type { Page } from '../../tests/manager/decipad-tests';
import { test } from '../../tests/manager/decipad-tests';
import { Workspace } from '../../tests/manager/workspace';

test.describe('staging teardown', () => {
  let page: Page;
  let workspace: Workspace;

  const deployName = process.env.DEPLOY_NAME;
  const stagingURL =
    deployName === 'dev'
      ? 'https://dev.decipad.com'
      : `https://${deployName}.decipadstaging.com`;

  if (!stagingURL) {
    // eslint-disable-next-line no-console
    console.warn('Staging URL is not set');
    return;
  }
  test('clean workspace', async ({ browser }) => {
    // get staging user agent string
    const userAgent = process.env.USER_AGENT_KEY;

    // Create a new browser context with the custom user agent
    const context = await browser.newContext({
      userAgent,
    });

    // Use the custom context to create a new page
    page = await context.newPage();
    workspace = new Workspace(page);
    await page.goto(stagingURL);

    // restored an empty workspace for the next test
    await workspace.deleteAllWorkspaceNotebooks();

    await page.close();
  });
});
