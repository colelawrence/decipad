import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { Timeouts, createWorkspace } from '../utils/src';
import {
  createCodeLineV2Below,
  createNumberInputBelow,
} from '../utils/page/Block';

test.describe('Tests code results from custom units', () => {
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

  test('Tests whether exprRef shows up', async () => {
    await createNumberInputBelow(page, 'CustomUnit', '8 hours');
    await createCodeLineV2Below(
      page,
      'ApplyCustomUnit',
      '24 hours in CustomUnit'
    );
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(page.getByText('exprRef')).toBeHidden();
  });
});
