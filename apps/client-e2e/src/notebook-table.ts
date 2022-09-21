import waitForExpect from 'wait-for-expect';
import {
  addColumn,
  addRow,
  createTable,
  getFromTable,
  openColumnMenu,
  openRowMenu,
  writeInTable,
} from './page-utils/Table';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from './page-utils/Pad';

describe('notebook table', () => {
  beforeAll(goToPlayground);
  beforeAll(() => waitForEditorToLoad());

  it('creates a table', async () => {
    expect(await page.$('[contenteditable] table')).toBe(null);

    await focusOnBody();
    await page.keyboard.insertText('This is some text.');
    await keyPress('Enter');
    await createTable();
  });

  it('can fill a table', async () => {
    await writeInTable('1', 1);
    await writeInTable('2', 2);
    await writeInTable('3', 3);
    expect(await getFromTable(1)).toBe('1');
    expect(await getFromTable(2)).toBe('2');
    expect(await getFromTable(3)).toBe('3');
  });

  it('can delete a row', async () => {
    await openRowMenu(3);
    await page.locator('span', { hasText: 'Delete' }).click();
    expect(await getFromTable(1)).toBe('1');
    expect(await getFromTable(2)).toBe('2');
  });

  it('can add a new row', async () => {
    await addRow();
    await writeInTable('7', 3);
    expect(await getFromTable(3)).toBe('7');
  });

  it('can add a new column', async () => {
    await addColumn();
    expect(await getFromTable(0, 3)).toEqual('Property4');
  });

  it('can write spaces in a table cell', async () => {
    await page.waitForTimeout(2000);
    await writeInTable(
      'The rain  in   spain    falls     mainly in the plane!',
      1,
      1
    );
    expect(await getFromTable(1, 1)).toBe(
      'The rain  in   spain    falls     mainly in the plane!'
    );
  });

  it('can change column type to a formula', async () => {
    await openColumnMenu(2);
    await page.press('[role="menuitem"]:has-text("Change type")', 'Enter');
    await page.press('[role="menuitem"]:has-text("Formula")', 'Enter');

    const codeBlock = await page.waitForSelector('section:has-text("=")');
    const codeBlockText = await codeBlock.innerText();

    expect(codeBlockText).toContain('Property3 =');

    // focused on formula
    await waitForExpect(async () => {
      const hasFocusOnSection = `
        document.hasFocus() &&
        document.getSelection()?.anchorNode?.parentElement?.closest?.('section') != null
      `;
      expect(await page.evaluate(hasFocusOnSection)).toBe(true);
    });
  });

  it('formula produced desired output', async () => {
    await page.keyboard.type('1 + 1');

    const codeBlock = await page.waitForSelector(
      'section:has-text("="):first-child'
    );
    const codeBlockText = await codeBlock.innerText();
    // splitting on new line removes the text from auto-complete menu
    expect(codeBlockText.split('\n')[0]).toBe('Property3 =  1 + 1');

    // some time for the computer to update
    await page.waitForTimeout(1000);

    expect((await getFromTable(1, 2, true))?.trim()).toBe('2');
  });
});
