import { BrowserContext, expect, Page, test } from '@playwright/test';

test.describe('Stripe integration', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    await page.goto('/');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('testing Stripe Checkout integration', async () => {
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
