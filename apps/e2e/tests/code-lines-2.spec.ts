import { BrowserContext, expect, Page, test } from '@playwright/test';
import { createCodeLineV2Below } from '../utils/page/Block';
import { setUp, waitForEditorToLoad } from '../utils/page/Editor';

// eslint-disable-next-line playwright/no-skipped-test
test.describe('Calculation Blocks v2', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();
    await setUp(
      { page, context },
      {
        featureFlags: { CODE_LINE_NAME_SEPARATED: true },
      }
    );
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Calculates 1 + 1', async () => {
    await createCodeLineV2Below(page, 'MyVariable', '1 + 1');
    await expect(
      page.getByTestId('codeline-code').last().getByTestId('code-line-result:2')
    ).toBeVisible();
  });

  test('Ensures variable name is unique', async () => {
    await createCodeLineV2Below(page, 'MyVariable', '');
    // Expected behavior is that the codeline-code will turn MyVariable to MyVariable2
    await expect(page.getByText('MyVariable2', { exact: true })).toBeVisible();
  });
});
