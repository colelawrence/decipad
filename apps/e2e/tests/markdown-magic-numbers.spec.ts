import { expect, Page, test } from '@playwright/test';
import { createInputBelow } from '../utils/page/Block';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';

test.describe('Inputs and magic numbers', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('can create an input', async () => {
    await focusOnBody(page);
    await createInputBelow(page, 'Foo', 1337);
    await keyPress(page, 'ArrowRight');
    await expect(page.locator('text=1337')).toBeVisible();
  });

  test('can retrieve the value of an interactive input', async () => {
    await keyPress(page, 'Enter');
    await keyPress(page, 'ArrowDown');
    await page.keyboard.type('That foo is %Foo% .');
    await keyPress(page, 'Enter');
    await expect(
      page.getByTestId('magic-number').getByText('1,337')
    ).toBeVisible();
  });
});
