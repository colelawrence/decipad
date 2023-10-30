import { expect, Page, test } from '@playwright/test';
import { PlaywrightManagerFactory } from './manager';
import { focusOnBody } from '../utils/page/Editor';
import { snapshot, Timeouts } from '../utils/src';

test.describe('notebook basic interactions @editor', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('notebook undo', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await test.step('undo keyboard shortcuts', async () => {
      await focusOnBody(page);
      await page.keyboard.type('Hello');

      const text = page.locator('text="Hello"');

      await expect(text).toBeVisible();

      await page.keyboard.press('Control+z');
      await expect(text).toBeHidden();

      await page.keyboard.press('Control+Shift+z');
      await expect(text).toBeVisible();
    });
  });

  test(`validate multiple clicks don't crash editor`, async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await focusOnBody(page);
    await page.keyboard.insertText('test test test');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.typing);

    await page.getByText('test test test').dblclick();
    await page.getByText('test test test').dblclick();
    await page.keyboard.press('Backspace');
    await expect(page.getByText('Contact support')).toBeHidden();
  });

  test('can create a heading', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await focusOnBody(page);
    await page.keyboard.press('Enter');
    await page.keyboard.type('# Heading');
    await page.keyboard.press('Enter');
    await expect(page.locator('svg title:has-text("Hide")')).toHaveCount(0);
    await page.keyboard.type('The sentence meaning of life.');
    await page.locator('[data-slate-editor] h2').waitFor();
    await page.getByTestId('drag-handle').nth(1).click();
    await page.getByRole('menuitem').getByText('Hide from reader').click();
    await expect(page.locator('svg title:has-text("Hide")')).toHaveCount(1);
  });

  test('inserts a link using markdown syntax', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await focusOnBody(page);
    await page.keyboard.type('[text](https://example.com/)');
    const locator = page.locator('a').filter({ hasText: 'text' });
    await expect(locator).toHaveAttribute('href', 'https://example.com/');
  });

  test('inserts a magic number', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await focusOnBody(page);
    await page.keyboard.press('Enter');

    await manager.StructuredInput.Create('Foo', '4');

    await manager.SelectLastParagraph();
    await page.keyboard.type('The sentence meaning of life is %Foo%');
    await expect(
      page.getByText('The sentence meaning of life is 4Foo')
    ).toBeVisible();
  });

  test('writing in the editor', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await test.step('starts empty', async () => {
      expect(
        (await page.textContent('[data-testid=paragraph-content]'))!.trim()
      ).toBe('');
    });

    await test.step('allows changing the first paragraph on the body', async () => {
      await focusOnBody(page);
      await expect(page.getByText('for new blocks')).toBeVisible();
      await manager.SelectLastParagraph();
      await page.keyboard.type('this is the content for the first paragraph');
      await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
        'this is the content for the first paragraph'
      );
    });

    await test.step('can make test bold, italic', async () => {
      const p = page.getByText('this is the content for the first paragraph');
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.typing);
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

    await test.step('allows to create a new paragraph', async () => {
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(3);
    });
    await test.step('allows to type in the second paragraph', async () => {
      await page.keyboard.type('this is the content for the second paragraph');
      await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
        'this is the content for the second paragraph'
      );
    });

    await test.step('allows to create even another new paragraph', async () => {
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(4);
    });
    await test.step('allows to type in the third paragraph', async () => {
      await page.keyboard.type('this is the content for the third paragraph');
      await expect(page.getByTestId('paragraph-wrapper').nth(2)).toHaveText(
        'this is the content for the third paragraph'
      );
    });

    await test.step('allows to go back to the previous paragraph and remove some text', async () => {
      // navigate to the element with flake redundancy
      await page.keyboard.press('ArrowUp');
      // navigate to the end with flake redundancy
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.keyPressDelay);
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      for (let i = 0; i < ' paragraph'.length; i += 1) {
        await page.keyboard.press('Backspace');
      }
      await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
        'this is the content for the second'
      );
    });

    await test.step('allows appending some text to an existing paragraph', async () => {
      await page.keyboard.type(' para-graph');
      await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
        'this is the content for the second para-graph'
      );
    });

    await test.step('can split a paragraph in two', async () => {
      for (let i = 0; i < 'second para-graph'.length; i += 1) {
        await page.keyboard.press('ArrowLeft');
      }
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(5);

      await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
        'this is the content for the '
      );
      await expect(page.getByTestId('paragraph-wrapper').nth(2)).toHaveText(
        'second para-graph'
      );
    });
  });
});
