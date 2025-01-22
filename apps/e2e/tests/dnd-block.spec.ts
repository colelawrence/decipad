import { focusTrailingParagraph } from '../utils/page/Block';
import { Locator, Page, expect, test } from './manager/decipad-tests';

const getParagraphByText = (page: Page, text: string) =>
  page.locator('[data-type="paragraph"]').filter({ hasText: text });

const getParagraphWrapperByText = (page: Page, text: string) =>
  page.locator('[data-testid="paragraph-wrapper"]').filter({ hasText: text });

const dragTo = async (
  page: Page,
  block: Locator,
  target: Locator,
  side: 'center' | 'top' | 'left' | 'bottom' | 'right'
) => {
  await block.getByTestId('drag-handle').hover();
  await page.mouse.down();

  const boundingBox = (await target.boundingBox())!;
  const startX = boundingBox.x;
  const startY = boundingBox.y;
  const centerX = boundingBox.x + boundingBox.width / 2;
  const centerY = boundingBox.y + boundingBox.height / 2;
  const endX = boundingBox.x + boundingBox.width;
  const endY = boundingBox.y + boundingBox.height;

  const position = {
    center: [centerX, centerY],
    top: [centerX, startY],
    left: [startX - 20, centerY],
    bottom: [centerX, endY],
    right: [endX + 20, centerY],
  }[side] as [number, number];

  await page.mouse.move(...position);
  await page.mouse.up();
};

const getParagraphTexts = async (
  page: Page,
  container: Page | Locator = page
) => {
  const paragraphs = await container.getByTestId('paragraph-content').all();

  return Promise.all(
    paragraphs.map((paragraph) =>
      paragraph.textContent().then(
        // Strip out Slate's zero width space
        (text) => text?.replace('\uFEFF', '')
      )
    )
  );
};

test('Drag and drop blocks', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await test.step('set up blocks', async () => {
    await focusTrailingParagraph(page);
    await page.keyboard.insertText('one');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('two');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('three');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('four');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('five');
  });

  await test.step('move block down', async () => {
    await dragTo(
      page,
      getParagraphByText(page, 'two'),
      getParagraphByText(page, 'four'),
      'bottom'
    );

    expect(await getParagraphTexts(page)).toEqual([
      'one',
      'three',
      'four',
      'two',
      'five',
      '',
    ]);
  });

  await test.step('move block up', async () => {
    await dragTo(
      page,
      getParagraphByText(page, 'two'),
      getParagraphByText(page, 'three'),
      'top'
    );

    expect(await getParagraphTexts(page)).toEqual([
      'one',
      'two',
      'three',
      'four',
      'five',
      '',
    ]);
  });

  await test.step('move block to top', async () => {
    await dragTo(
      page,
      getParagraphByText(page, 'three'),
      getParagraphByText(page, 'one'),
      'top'
    );

    expect(await getParagraphTexts(page)).toEqual([
      'three',
      'one',
      'two',
      'four',
      'five',
      '',
    ]);
  });

  await test.step('combine two normal blocks into layout', async () => {
    await dragTo(
      page,
      getParagraphByText(page, 'one'),
      getParagraphWrapperByText(page, 'three'),
      'left'
    );

    const layout = page.locator('[data-type="layout"]');

    expect(await getParagraphTexts(page, layout)).toEqual(['one', 'three']);

    expect(await getParagraphTexts(page)).toEqual([
      // BEGIN LAYOUT
      'one',
      'three',
      // END LAYOUT
      'two',
      'four',
      'five',
      '',
    ]);
  });

  await test.step('add block to layout', async () => {
    await dragTo(
      page,
      getParagraphByText(page, 'two'),
      getParagraphByText(page, 'one'),
      'right'
    );

    const layout = page.locator('[data-type="layout"]');

    expect(await getParagraphTexts(page, layout)).toEqual([
      'one',
      'two',
      'three',
    ]);

    expect(await getParagraphTexts(page)).toEqual([
      // BEGIN LAYOUT
      'one',
      'two',
      'three',
      // END LAYOUT
      'four',
      'five',
      '',
    ]);
  });

  await test.step('move block right in same layout', async () => {
    await dragTo(
      page,
      getParagraphByText(page, 'one'),
      getParagraphWrapperByText(page, 'three'),
      'right'
    );

    const layout = page.locator('[data-type="layout"]');

    expect(await getParagraphTexts(page, layout)).toEqual([
      'two',
      'three',
      'one',
    ]);
  });

  await test.step('move block left in same layout', async () => {
    await dragTo(
      page,
      getParagraphByText(page, 'three'),
      getParagraphWrapperByText(page, 'two'),
      'left'
    );

    const layout = page.locator('[data-type="layout"]');

    expect(await getParagraphTexts(page, layout)).toEqual([
      'three',
      'two',
      'one',
    ]);
  });

  await test.step('move block out of and above layout', async () => {
    const layout = page.locator('[data-type="layout"]');

    await dragTo(page, getParagraphByText(page, 'one'), layout, 'top');

    expect(await getParagraphTexts(page, layout)).toEqual(['three', 'two']);

    expect(await getParagraphTexts(page)).toEqual([
      'one',
      // BEGIN LAYOUT
      'three',
      'two',
      // END LAYOUT
      'four',
      'five',
      '',
    ]);
  });

  await test.step('add new column', async () => {
    const layout = page.locator('[data-type="layout"]');
    await layout.getByTestId('block-action-add-column').click();
    expect(await getParagraphTexts(page, layout)).toEqual(['three', 'two', '']);
  });

  await test.step('move block out of and below layout', async () => {
    const layout = page.locator('[data-type="layout"]');

    await dragTo(page, getParagraphByText(page, 'two'), layout, 'bottom');

    expect(await getParagraphTexts(page, layout)).toEqual(['three', '']);

    expect(await getParagraphTexts(page)).toEqual([
      'one',
      // BEGIN LAYOUT
      'three',
      '',
      // END LAYOUT
      'two',
      'four',
      'five',
      '',
    ]);
  });

  await test.step('add new column', async () => {
    const layout = page.locator('[data-type="layout"]');
    await layout.getByTestId('block-action-add-column').click();
    expect(await getParagraphTexts(page, layout)).toEqual(['three', '', '']);
  });

  await test.step('move block from outside layout onto empty column', async () => {
    const layout = page.locator('[data-type="layout"]');

    await dragTo(
      page,
      getParagraphByText(page, 'one'),
      layout.locator('[data-type="paragraph"]').nth(1),
      'center'
    );

    expect(await getParagraphTexts(page, layout)).toEqual(['three', 'one', '']);

    expect(await getParagraphTexts(page)).toEqual([
      // BEGIN LAYOUT
      'three',
      'one',
      '',
      // END LAYOUT
      'two',
      'four',
      'five',
      '',
    ]);
  });

  await test.step('move block right onto empty column in same layout', async () => {
    const layout = page.locator('[data-type="layout"]');

    await dragTo(
      page,
      getParagraphByText(page, 'three'),
      layout.locator('[data-type="paragraph"]').nth(2),
      'center'
    );

    expect(await getParagraphTexts(page, layout)).toEqual(['', 'one', 'three']);
  });

  await test.step('move block left onto empty column in same layout', async () => {
    const layout = page.locator('[data-type="layout"]');

    await dragTo(
      page,
      getParagraphByText(page, 'three'),
      layout.locator('[data-type="paragraph"]').nth(0),
      'center'
    );

    expect(await getParagraphTexts(page, layout)).toEqual(['three', 'one', '']);
  });

  await test.step('create new layout', async () => {
    await notebook.addBlockSlashCommand('layout');

    await page.keyboard.type('New layout');

    expect(await getParagraphTexts(page)).toEqual([
      // BEGIN LAYOUT
      'three',
      'one',
      '',
      // END LAYOUT
      'two',
      'four',
      'five',
      // BEGIN LAYOUT
      'New layout',
      '',
      // END LAYOUT
      '',
    ]);
  });

  await test.step('move block from one layout onto empty column of another', async () => {
    const firstLayout = page.locator('[data-type="layout"]').nth(0);
    const secondLayout = page.locator('[data-type="layout"]').nth(1);

    await dragTo(
      page,
      getParagraphByText(page, 'one'),
      secondLayout.locator('[data-type="paragraph"]').nth(1),
      'center'
    );

    expect(await getParagraphTexts(page, firstLayout)).toEqual(['three', '']);

    expect(await getParagraphTexts(page, secondLayout)).toEqual([
      'New layout',
      'one',
    ]);

    expect(await getParagraphTexts(page)).toEqual([
      // BEGIN LAYOUT
      'three',
      '',
      // END LAYOUT
      'two',
      'four',
      'five',
      // BEGIN LAYOUT
      'New layout',
      'one',
      // END LAYOUT
      '',
    ]);
  });

  await test.step('move block from one layout next to column of another', async () => {
    const layout = page.locator('[data-type="layout"]');

    // Second layout is automatically unwraped since it has only one column
    await dragTo(
      page,
      getParagraphByText(page, 'one'),
      getParagraphWrapperByText(page, 'three'),
      'left'
    );

    expect(await layout.count()).toBe(1);

    expect(await getParagraphTexts(page, layout)).toEqual(['one', 'three', '']);

    expect(await getParagraphTexts(page)).toEqual([
      // BEGIN LAYOUT
      'one',
      'three',
      '',
      // END LAYOUT
      'two',
      'four',
      'five',
      'New layout',
      '',
    ]);
  });
});
