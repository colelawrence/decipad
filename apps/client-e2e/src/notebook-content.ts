import { Page } from 'playwright-core';

import {
  focusOnBody,
  keyPress,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';
import { snapshot } from './utils';

describe('notebook content', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  it('starts empty', async () => {
    expect((await page.textContent('[contenteditable] h1'))!.trim()).toBe('');
    expect((await page.textContent('[contenteditable] p'))!.trim()).toBe('');
  });

  it('allows changing the first paragraph on the body', async () => {
    await focusOnBody();
    await page.keyboard.type('this is the content for the first paragraph');
    const firstParagraph = await page.waitForSelector(
      '[contenteditable] p >> nth=0'
    );
    expect(await firstParagraph.textContent()).toBe(
      'this is the content for the first paragraph'
    );
  });

  it('can make test bold, italic', async () => {
    const p = page.locator('text=this is the content for the first paragraph');
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

  it('allows to create a new paragraph', async () => {
    await keyPress('Enter');
    expect(await page.$$('[contenteditable] p')).toHaveLength(3);
  });
  it('allows to type in the second paragraph', async () => {
    await page.keyboard.type('this is the content for the second paragraph');
    const [, p2] = await page.$$('[contenteditable] p');
    expect(await p2.textContent()).toBe(
      'this is the content for the second paragraph'
    );
  });

  it('allows to create even another new paragraph', async () => {
    await keyPress('Enter');
    expect(await page.$$('[contenteditable] p')).toHaveLength(4);
  });
  it('allows to type in the third paragraph', async () => {
    await page.keyboard.type('this is the content for the third paragraph');
    const [, , p3] = await page.$$('[contenteditable] p');
    expect(await p3.textContent()).toBe(
      'this is the content for the third paragraph'
    );
  });

  // TODO figure out how to make less flaky
  /* eslint-disable jest/no-disabled-tests */
  it.skip('allows to go back to the previous paragraph and remove some text', async () => {
    const [, p2] = await page.$$('[contenteditable] p');

    // navigate to the element with flake redundancy
    await keyPress('ArrowUp');
    p2.focus();
    // navigate to the end with flake redundancy
    await keyPress('End');
    await keyPress('End');

    for (let i = 0; i < ' paragraph'.length; i += 1) {
      await keyPress('Backspace');
    }
    expect(await p2.textContent()).toBe('this is the content for the second');
  });

  it.skip('allows appending some text to an existing paragraph', async () => {
    await page.keyboard.type(' para-graph');
    const [, p2] = await page.$$('[contenteditable] p');
    expect(await p2.textContent()).toBe(
      'this is the content for the second para-graph'
    );
  });

  it.skip('can split a paragraph in two', async () => {
    for (let i = 0; i < 'second para-graph'.length; i += 1) {
      await keyPress('ArrowLeft');
    }
    await keyPress('Enter');
    expect(await page.$$('[contenteditable] p')).toHaveLength(4);

    const [, p2, p3] = await page.$$('[contenteditable] p');
    expect(await p2.textContent()).toBe('this is the content for the ');
    expect(await p3.textContent()).toBe('second para-graph');
  });
});
