import { expect, test } from './manager/decipad-tests';
import { snapshot } from '../utils/src';

test('Checks notebook embeds @embeds @snapshot', async ({ testUser }) => {
  const { page, notebook, workspace } = testUser;

  await notebook.returnToWorkspace();
  await workspace.newWorkspace('new workspace for clean snapshot');
  const currentRoute = page.url();

  await page.getByTestId('workspace_upgrade_pro').click();
  await expect(page.getByText('Choose a plan')).toBeVisible();
  await snapshot(testUser.page, 'Workspace: Upgrade Plan');
  await page.getByTestId('paywall_upgrade').click();

  await expect(
    page
      .frameLocator('iframe[name="embedded-checkout"]')
      .getByTestId('hosted-payment-submit-button')
  ).toBeVisible();

  await page.setContent(`
    <button id="redirect_button" onClick="window.location.replace('${currentRoute}')">Redirect do Decipad</button>
  `);
  await page.click('#redirect_button');

  await expect(workspace.workspaceHeroName).toBeVisible();
});
