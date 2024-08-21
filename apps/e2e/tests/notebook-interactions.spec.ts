import type { Page } from './manager/decipad-tests';
import { expect, test } from './manager/decipad-tests';
import { snapshot, Timeouts } from '../utils/src';
import startingACandleBusiness from '../__fixtures__/gallery/apple-model.json';

test('undo keyboard shortcuts', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await page.keyboard.type('hello world');
  const text = page.locator('text="hello world"');
  await expect(text).toBeVisible();

  await page.keyboard.press('Control+z');
  await expect(text).toBeHidden();

  await page.keyboard.press('Control+Shift+z');
  await expect(text).toBeVisible();
});

test('check slash command', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await page.keyboard.type('/t');

  await expect(
    page.locator('article').getByTestId('menu-item-table')
  ).toBeVisible();
  await expect(
    page.locator('article').getByTestId('paragraph-wrapper')
  ).toHaveCount(2);

  await snapshot(page as Page, 'Notebook: Slash Command');
});

test(`validate multiple clicks don't crash editor`, async ({ testUser }) => {
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await page.keyboard.insertText('test test test');

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);

  await page.getByText('test test test').dblclick();
  await page.getByText('test test test').dblclick();
  await page.keyboard.press('Backspace');
  await expect(page.getByText('Contact support')).toBeHidden();
});

test('can create a heading', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
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

test('inserts a link using markdown syntax', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await page.keyboard.type('[text](https://example.com/)');
  const locator = page.locator('a').filter({ hasText: 'text' });
  await expect(locator).toHaveAttribute('href', 'https://example.com/');
});

test('text formatter options', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await test.step('starts empty', async () => {
    expect(
      (await page.textContent('[data-testid=paragraph-content]'))!.trim()
    ).toBe('');
  });

  await test.step('allows changing the first paragraph on the body', async () => {
    await notebook.focusOnBody();
    await expect(page.getByText('for new blocks')).toBeVisible();
    await notebook.selectLastParagraph();
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

test('text formatter with mouse', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await notebook.selectLastParagraph();
  await page.keyboard.type('this is the content for the first paragraph');
  await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
    'this is the content for the first paragraph'
  );

  // text that will be selected by the mouse
  const p = page.getByText('for the first par');

  // Get the bounding box of the paragraph
  const box = await p.boundingBox();

  // eslint-disable-next-line playwright/no-conditional-in-test
  if (box) {
    // Calculate positions for the selection
    const startX = box.x + 130; // approximate position before "for"
    const startY = box.y + box.height / 2;
    const endX = box.x + 230; // approximate position after "the first"
    const endY = startY;

    // Simulate mouse actions to select "for the first"
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY);
    await page.mouse.up();
  } else {
    throw new Error('Failed to retrieve bounding box for the paragraph');
  }

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
});

test('check notebook scroll with clicks', async ({ testUser }) => {
  let initialscrollPosition: number;
  let newscrollPosition: number;
  const { page, notebook } = testUser;

  await test.step('check go to definition scroll', async () => {
    await testUser.importNotebook(startingACandleBusiness);

    await notebook.waitForEditorToLoad();
    // hover a variable from the notebook
    await page.locator('code').getByText('Historicals').nth(0).hover();
    initialscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    await page.getByTestId('go-to-definition').click();
    // wait for scroll
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    newscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    expect(initialscrollPosition !== newscrollPosition).toBeTruthy();
  });

  await test.step('check go catalog titles scrool', async () => {
    await page.getByTestId('segment-button-trigger-top-bar-sidebar').click();
    await page.getByTestId('sidebar-Data').click();

    initialscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    await page
      .getByTestId('number-catalog-link')
      .filter({ hasText: 'Step 3' })
      .click();
    // wait for scroll
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);

    newscrollPosition = await page.evaluate(() => {
      return window.scrollY;
    });
    expect(initialscrollPosition !== newscrollPosition).toBeTruthy();
  });
});
