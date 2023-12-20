import { expect, test } from './manager/decipad-tests';

test('Data connections', async ({ testUser }) => {
  const { page } = testUser;
  await test.step('Can see data connections button', async () => {
    await page.goto('/');
    const dataConnections = page.locator('text="Data Connections"');
    await expect(dataConnections).toBeVisible();
  });

  await test.step('Can click data connections and view modal', async () => {
    const dataConnections = page.locator('text="Data Connections"');
    await dataConnections.click();

    const apiSecrets = page.locator('text="API Secrets"');
    const sqlConnections = page.locator('text="SQL Connections"');

    await expect(apiSecrets).toBeVisible();
    await expect(sqlConnections).toBeVisible();
  });

  await test.step('Clicking code secrets shows the code secrets UI, and allows user to add.', async () => {
    const apiSecrets = page.locator('text="API Secrets"');
    await apiSecrets.click();

    const secretName = page.locator('[data-testid="input-secret-name"]');
    const secretValue = page.locator('[data-testid="input-secret-value"]');
    const addSecret = page.locator('[data-testid="add-secret-button"]');

    await secretName.fill('MySecret');
    await secretValue.fill('123');
    await addSecret.click();

    const newSecret = page.locator('text="MySecret"');

    await expect(newSecret).toBeVisible();
  });

  await test.step('Can delete code secrets', async () => {
    const deleteSecret = page.locator('[data-testid="delete-secret"]');
    await deleteSecret.click();

    const secretName = page.locator('text="MySecret"');

    await expect(secretName).toHaveCount(0);
  });

  await test.step('Can view SQL Connections', async () => {
    const sqlConnectionButton = page.locator('text="SQL Connections"');
    await sqlConnectionButton.click();

    const addConnButton = page.locator('text="Add a New Connection"');

    await expect(addConnButton).toBeVisible();
  });

  await test.step('Can add SQL Connection', async () => {
    const addConnButton = page.locator('text="Add a New Connection"');
    await addConnButton.click();

    // Clicking on the label for an input should focus input.
    // It's a good test to make sure we're following best practices.
    const sqlConnName = page.locator('text="Connection Name"');
    await sqlConnName.click();
    await sqlConnName.fill('MyConnection');

    const sqlConnUrl = page.locator(
      'text="SQL URL (Containing credentials, port and database host)"'
    );
    await sqlConnUrl.click();
    await sqlConnUrl.fill('MyUrl');

    const submitConn = page.getByTestId('add-conn-button');
    await expect(submitConn).toBeVisible();

    await submitConn.click();

    const successToast = page.locator('text="Successfully added connection"');

    await expect(successToast).toBeVisible();
  });
});
