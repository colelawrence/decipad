import { expect, Page, test } from '@playwright/test';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';
import { snapshot } from '../utils/src';

test.describe('Writing in the editor', () => {
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

  test('starts empty', async () => {
    expect(
      (await page.textContent('[data-testid=paragraph-content]'))!.trim()
    ).toBe('');
  });

  test('allows changing the first paragraph on the body', async () => {
    await focusOnBody(page);
    await page.keyboard.type('this is the content for the first paragraph');
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      'this is the content for the first paragraph'
    );
  });

  test('can make test bold, italic', async () => {
    const p = page.getByText('this is the content for the first paragraph');
    await p.selectText();

    // checks the actual text style.
    const beforeTextStyles = await p.evaluate((element) => [
      window.getComputedStyle(element).getPropertyValue('font-weight'),
      window.getComputedStyle(element).getPropertyValue('font-style'),
    ]);

    await page.click('button:has-text("Bold")');
    await page.click('button:has-text("Italic")');

    // checks the actual text style.
    const textStyles = await p.evaluate((element) => [
      window.getComputedStyle(element).getPropertyValue('font-weight'),
      window.getComputedStyle(element).getPropertyValue('font-style'),
    ]);

    // compare the before styles with the current styles.
    expect(textStyles[0] > beforeTextStyles[0]).toBe(true);
    expect(textStyles[1] !== beforeTextStyles[1]).toBe(true);

    // get stroke width of an unclicked button.
    const unclickedButtonStroke = await page
      .locator('button:has-text("Underline") div svg path')
      .nth(1)
      .evaluate((e) =>
        window.getComputedStyle(e).getPropertyValue('stroke-width')
      );

    // check if the bold and italic button are highlighted.
    // by checking the stroke width on their path svgs.
    const boldButtonPaths = page.locator(
      'button:has-text("Bold") div svg path'
    );

    const boldPathNums = await boldButtonPaths.count();

    // I tried to use pathElements.evaluateAll but it didn't like it.
    for (let i = 0; i < boldPathNums; i += 1) {
      const el = boldButtonPaths.nth(i);

      // eslint-disable-next-line
      const strokeWidth = await el.evaluate((element) =>
        window.getComputedStyle(element).getPropertyValue('stroke-width')
      );
      expect(strokeWidth).not.toBe(unclickedButtonStroke);
    }

    await snapshot(page as Page, 'Notebook: Text Toolbar');
  });

  test('allows to create a new paragraph', async () => {
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(3);
  });
  test('allows to type in the second paragraph', async () => {
    await page.keyboard.type('this is the content for the second paragraph');
    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      'this is the content for the second paragraph'
    );
  });

  test('allows to create even another new paragraph', async () => {
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
  });
  test('allows to type in the third paragraph', async () => {
    await page.keyboard.type('this is the content for the third paragraph');
    await expect(page.getByTestId('paragraph-wrapper').nth(2)).toHaveText(
      'this is the content for the third paragraph'
    );
  });

  test('allows to go back to the previous paragraph and remove some text', async () => {
    // navigate to the element with flake redundancy
    await page.keyboard.press('ArrowUp');
    // navigate to the end with flake redundancy
    await page.keyboard.press('End');

    for (let i = 0; i < ' paragraph'.length; i += 1) {
      await page.keyboard.press('Backspace');
    }
    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      'this is the content for the second'
    );
  });

  test('allows appending some text to an existing paragraph', async () => {
    await page.keyboard.type(' para-graph');
    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      'this is the content for the second para-graph'
    );
  });

  test('can split a paragraph in two', async () => {
    for (let i = 0; i < 'second para-graph'.length; i += 1) {
      await keyPress(page, 'ArrowLeft');
    }
    await keyPress(page, 'Enter');
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(5);

    await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
      'this is the content for the '
    );
    await expect(page.getByTestId('paragraph-wrapper').nth(2)).toHaveText(
      'second para-graph'
    );
  });
});
