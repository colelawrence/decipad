import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { Timeouts, createWorkspace } from '../utils/src';

test.describe('More JS codeblock checks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Create a variable', async () => {
    await page.getByTestId('paragraph-content').last().fill('/');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await page.getByTestId('menu-item-structured-input').first().click();
    await page.getByTestId('codeline-code').fill('1000$');
  });

  test('Checks if the variable is accessible inside of the notebook', async () => {
    const code = `
// returns variable Unnamed1
return this.Unnamed1;`;
    await page.getByTestId('paragraph-content').last().fill('/');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await page.getByTestId('menu-item-open-integration').first().click();
    await page.getByTestId('select-integration:Code').click();

    // First line of the CodeMirror
    await page
      .getByTestId('code-mirror')
      .getByRole('textbox')
      .locator('div')
      .first()
      .fill(code);

    await page.getByTestId('text-icon-button:Run').click();
    await expect(page.getByTestId('code-successfully-run')).toBeVisible();
    await page.getByTestId('integration-modal-continue').click();

    await expect(page.getByTestId('number-result:1,000')).toBeVisible();

    await page.getByTestId('integration-modal-continue').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);
  });
});
