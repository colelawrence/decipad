import { BrowserContext, expect, Page, test } from '@playwright/test';
import { keyPress, setUp } from '../utils/page/Editor';
import { createWorkspace, getClearText, Timeouts } from '../utils/src';

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

  let generatedVarName: string;

  test('Create a variable', async () => {
    await keyPress(page, 'Enter');
    await keyPress(page, '=');

    await page.waitForSelector(
      '[data-slate-editor] [data-testid="codeline-varname"]'
    );

    generatedVarName = await page.evaluate(
      getClearText,
      await page.locator('[data-testid="codeline-varname"]').nth(0).innerHTML()
    );

    await expect(
      await page
        .locator('[data-testid="codeline-varname"]')
        .nth(0)
        .textContent()
    ).toMatch(/[a-zA-Z_$][a-zA-Z0-9_$]*/);
  });

  test('Checks if the variable is accessible inside of the notebook', async () => {
    const code = `
// returns variable ${generatedVarName}
return this.${generatedVarName};`;
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

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

    await expect(page.getByTestId('number-result:100')).toBeVisible();

    await page.getByTestId('integration-modal-continue').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);
  });
});
