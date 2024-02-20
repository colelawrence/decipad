import { expect, test } from './manager/decipad-tests';
import { snapshot } from '../utils/src';

test.describe('Stripe integration', () => {
  test('testing Stripe Checkout integration', async ({ randomFreeUser }) => {
    const { context, page } = randomFreeUser;
    await randomFreeUser.goToWorkspace();

    const currentRoute = page.url();

    await context.route('**/*', (route) => {
      // Mock the Stripe checkout page
      if (route.request().url().includes('buy.stripe.com')) {
        const mockedResponse = {
          status: 200,
          contentType: 'text/html',
          body: `<h1>Mocked Stripe Checkout Page</h1><button id="redirect_button" onClick="window.location.replace('${currentRoute}?fromStripe=true')">Redirect do Decipad</button>`,
        };
        route.fulfill(mockedResponse);
      } else {
        // For other requests, continue as normal
        route.continue();
      }
    });

    // click on Upgrade to Pro in the workspace dashboard
    await page.click('[data-testid="workspace_upgrade_pro"]');
    await snapshot(page, 'Upgrade modal');
    // click on Upgrade to pro button in the modal
    await page.click('[data-testid="paywall_upgrade_pro"]');
    // redirect the user back to Deci
    await page.click('#redirect_button');
    // wait for the redirect back
    await page.waitForURL(`${currentRoute}?fromStripe=true`);

    // ensure we display a popup
    // TODO: find a way to mock our graphQL queries on client side
    await expect(page.getByTestId('subscription_status_modal')).toBeVisible();
  });
});
