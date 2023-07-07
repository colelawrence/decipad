import { expect, Page, test } from '@playwright/test';
import { createInputBelow } from '../utils/page/Block';
import {
  focusOnBody,
  goToPlayground,
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
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('1337')).toBeVisible();
  });

  test('can retrieve the value of an interactive input', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('That foo is %Foo% .');
    await page.keyboard.press('Enter');
    await expect(
      page.getByTestId('magic-number').getByText('1,337')
    ).toBeVisible();
  });

  test('it can render columns inline', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('What %[1,2,3,4,5]% .');
    await page.keyboard.press('Enter');
    await page.getByTestId('number-column-separator').last().waitFor();
    await page.getByTestId('number-column-ellipsis').last().waitFor();
  });
});
