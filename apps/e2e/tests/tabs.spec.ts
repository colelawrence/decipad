import { BrowserContext, Page, test, expect } from '@playwright/test';
import { focusOnBody, setUp } from '../utils/page/Editor';
import { createTab, getTabName, selectTab } from 'apps/e2e/utils/page/Tab';
import {
  createCalculationBlockBelow,
  moveToTab,
  selectBlocks,
} from 'apps/e2e/utils/page/Block';

test.describe('Test notebooks using multiple tabs', () => {
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
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Create a new tab', async () => {
    await createTab(page, 'Tab 1');
    await createTab(page, 'Tab 2');
    await createTab(page, 'Tab 3');
    await selectTab(page, 0);

    const [tab, tab1, tab2, tab3] = await Promise.all([
      getTabName(page, 0),
      getTabName(page, 1),
      getTabName(page, 2),
      getTabName(page, 3),
    ]);

    expect(tab).toContain('New Tab');
    expect(tab1).toContain('Tab 1');
    expect(tab2).toContain('Tab 2');
    expect(tab3).toContain('Tab 3');
  });

  test('Create blocks', async () => {
    await focusOnBody(page);
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.type(`Block ${i}`);
      await page.keyboard.press('Enter');
    }
  });

  test('Move single block to different tab', async () => {
    await moveToTab(page, 0, 0);
    await selectTab(page, 1);
    const blockText = await page
      .locator('[data-testid="paragraph-wrapper"] >> nth=0')
      .innerText();
    expect(blockText).toContain('Block 0');
  });

  test('Move multiple blocks to different tab', async () => {
    await selectTab(page, 0);
    await selectBlocks(page, 0, 2);
    await moveToTab(page, 0, 1);
    await selectTab(page, 2);

    const [block1, block2, block3] = await Promise.all([
      page.locator('[data-testid="paragraph-wrapper"] >> nth=0').innerText(),
      page.locator('[data-testid="paragraph-wrapper"] >> nth=1').innerText(),
      page.locator('[data-testid="paragraph-wrapper"] >> nth=2').innerText(),
    ]);

    expect(block1).toContain('Block 1');
    expect(block2).toContain('Block 2');
    expect(block3).toContain('Block 3');
  });

  test('Move calculation based blocks to different tab', async () => {
    await selectTab(page, 3);
    await createCalculationBlockBelow(page, 'num1 = 10');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num2 = 20');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num1 + num2');
    await moveToTab(page, 2, 0);

    await expect(
      page.getByTestId('code-line').first().getByTestId('number-result:10')
    ).toBeVisible();
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    await selectTab(page, 0);

    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeVisible();
  });
});
