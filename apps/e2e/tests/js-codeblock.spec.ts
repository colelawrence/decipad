import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { codePlaceholders, createWorkspace, Timeouts } from '../utils/src';

const executeCode = (page: Page, sourcecode: string, x: number) =>
  test.step(`Executing ${x}`, async () => {
    await page.getByTestId('paragraph-content').last().click();
    await page.keyboard.type('/');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.menuOpenDelay);
    await page.getByTestId('menu-item-open-integration').click();
    await page.getByTestId('select-integration:Code').click();

    // First line of the CodeMirror
    await page
      .getByTestId('code-mirror')
      .getByRole('textbox')
      .locator('div')
      .first()
      .fill(sourcecode);

    await page.getByTestId('text-icon-button:Run').click();

    await expect(page.getByTestId('code-successfully-run')).toBeVisible();

    await page.getByTestId('integration-modal-continue').click();

    await page
      .getByTestId('result-preview-input')
      .getByRole('textbox')
      .fill(String(x));

    await page.getByTestId('integration-modal-continue').click();
  });

test.describe('Make sure our js code templates work', () => {
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

  test('checks all the files', async () => {
    const allSources = codePlaceholders;

    expect(allSources.length).toBeGreaterThan(0);
    for (const [i, sourcecode] of allSources.entries()) {
      await executeCode(page, sourcecode, i);
    }
  });
});
