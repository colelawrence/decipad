import { expect, test } from '@playwright/test';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';

test.describe('Editor markdown marks', () => {
  test.beforeEach(async ({ page }) => {
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test('inserts a link using markdown syntax', async ({ page }) => {
    await focusOnBody(page);
    await page.keyboard.type('[text](https://example.com/)');
    const textElement = (await page.$('"text"'))!;
    const linkElement = await textElement.evaluateHandle(
      (text: HTMLElement) => text.closest('a')!
    );
    expect(await linkElement.getAttribute('href')).toEqual(
      'https://example.com/'
    );
  });

  test('inserts a magic number', async ({ page }) => {
    await focusOnBody(page);
    await keyPress(page, 'Enter');
    await page.keyboard.type('= Foo = 4');
    await keyPress(page, 'Enter');
    await page.keyboard.type('The sentence meaning of life is %Foo%');
    const magicNumber = await page.$('"is 1"');
    expect(magicNumber).toBeDefined();
  });

  test('deleted a magic number', async ({ page }) => {
    await focusOnBody(page);
    await keyPress(page, 'Backspace');
    const noMagic = await page.$('"1"');
    expect(noMagic).toBeNull();
  });
});
