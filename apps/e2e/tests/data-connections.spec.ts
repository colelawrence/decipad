import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Workspace';

test.describe('Auto complete menu', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await setUp({ page, context });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Can see data connections button', async () => {
    const dataConnections = page.locator('text="Data Connections"');
    await expect(dataConnections).toBeVisible();
  });

  test('Can click data connections and view modal', async () => {
    const dataConnections = page.locator('text="Data Connections"');
    await dataConnections.click();

    const apiSecrets = page.locator('text="API Secrets"');
    const sqlConnections = page.locator('text="SQL Connections"');

    await expect(apiSecrets).toBeVisible();
    await expect(sqlConnections).toBeVisible();
  });

  test('Clicking code secrets shows the code secrets UI, and allows user to add.', async () => {
    const apiSecrets = page.locator('text="API Secrets"');
    await apiSecrets.click();

    const secretName = page.locator('[data-testid="input-secret-name"]');
    const secretValue = page.locator('[data-testid="input-secret-value"]');
    const addSecret = page.locator('[data-testid="add-secret-button"]');

    await secretName.type('MySecret');
    await secretValue.type('123');
    await addSecret.click();

    const newSecret = page.locator('text="MySecret"');

    await expect(newSecret).toBeVisible();
  });

  test('Can delete code secrets', async () => {
    const deleteSecret = page.locator('[data-testid="delete-secret"]');
    await deleteSecret.click();

    const secretName = page.locator('text="MySecret"');

    await expect(secretName).toHaveCount(0);
  });

  test('Can view SQL Connections', async () => {
    const sqlConnectionButton = page.locator('text="SQL Connections"');
    await sqlConnectionButton.click();

    const addConnButton = page.locator('text="Add a New Connection"');

    await expect(addConnButton).toBeVisible();
  });

  test('Can add SQL Connection', async () => {
    const addConnButton = page.locator('text="Add a New Connection"');
    await addConnButton.click();

    // Clicking on the label for an input should focus input.
    // It's a good test to make sure we're following best practices.
    const sqlConnName = page.locator('text="Connection Name"');
    await sqlConnName.click();
    await sqlConnName.type('MyConnection');

    const sqlConnUrl = page.locator(
      'text="SQL URL (Containing credentials, port and database host)"'
    );
    await sqlConnUrl.click();
    await sqlConnUrl.type('MyUrl');

    const submitConn = page.getByTestId('add-conn-button');
    await expect(submitConn).toBeVisible();

    await submitConn.click();

    const successToast = page.locator('text="Successfully added connection"');

    await expect(successToast).toBeVisible();
  });
});
