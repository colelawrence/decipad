import { expect, test } from '@playwright/test';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { createCodeLineV2Below } from '../utils/page/Block';

test.describe('Editor markdown marks', () => {
  test.beforeEach(async ({ page }) => {
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test('can create a heading', async ({ page }) => {
    await focusOnBody(page);
    await keyPress(page, 'Enter');
    await page.keyboard.type('# Heading');
    await keyPress(page, 'Enter');
    await expect(page.locator('svg title:has-text("Hide")')).toHaveCount(0);
    await page.keyboard.type('The sentence meaning of life.');
    await page.waitForSelector('[data-slate-editor] h2');
    await page.getByTestId('drag-handle').nth(1).click();
    await page.locator('[role="menuitem"] >> text=Hide from reader').click();
    await expect(page.locator('svg title:has-text("Hide")')).toHaveCount(1);
  });

  test('inserts a link using markdown syntax', async ({ page }) => {
    await focusOnBody(page);
    await page.keyboard.type('[text](https://example.com/)');
    const locator = page.locator('a').filter({ hasText: 'text' });
    await expect(locator).toHaveAttribute('href', 'https://example.com/');
  });

  test('inserts a magic number', async ({ page }) => {
    await focusOnBody(page);
    await keyPress(page, 'Enter');

    await createCodeLineV2Below(page, 'Foo', '4');

    await keyPress(page, 'Enter');
    await page.keyboard.type('The sentence meaning of life is %Foo%');
    await expect(
      page.getByText('The sentence meaning of life is 4Foo')
    ).toBeVisible();
  });
});
