import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import {
  codePlaceholders,
  createWorkspace,
  getClearText,
  Timeouts,
} from '../utils/src';

test.describe('More JS codeblock checks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

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

  test('Checks the ability to change the unit of a response', async () => {
    const allSources = codePlaceholders;
    expect(allSources.length).toBeGreaterThan(0);

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
      .fill(allSources[5]);

    await page.getByTestId('text-icon-button:Run').click();
    await expect(page.getByTestId('code-successfully-run')).toBeVisible();
    await page.getByTestId('integration-modal-continue').click();

    const generatedVarName = await page.evaluate(
      getClearText,
      await page.getByTestId('result-preview-input').innerHTML()
    );

    await page
      .getByTestId('result-preview-input')
      .getByText(generatedVarName)
      .dblclick();
    await page.keyboard.press('Backspace');
    await page.keyboard.type('F');

    // The column menu button for the API response
    await page
      .getByRole('cell', { name: 'value' })
      .getByTestId('table-column-menu-button')
      .click();

    await page.getByRole('menuitem').getByText('Number').nth(1).click();

    await page.getByTestId('integration-modal-continue').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);
  });
});
