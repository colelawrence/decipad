import waitForExpect from 'wait-for-expect';
import { createTable, writeInTable } from './page-utils/Block';
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

    expect(await page.waitForSelector('[contenteditable] table')).not.toBe(
      null
    );
  });

  it('can fill a table', async () => {
    await writeInTable('X', 0);
    await writeInTable('1', 1);
    await writeInTable('2', 2);
    await writeInTable('3', 3);

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(1)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(1)')
      .textContent();
    const row3 = await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(1)')
      .textContent();

    expect(row1).toBe('1');
    expect(row2).toBe('2');
    expect(row3).toBe('3');
  });

  it('can delete a row', async () => {
    const delete3 = await page.$(':nth-match(button:has-text("Minus"), 3)');
    await delete3?.click();

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(1)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(1)')
      .textContent();

    expect(row1).toBe('1');
    expect(row2).toBe('2');
  });

  it('can add a new row', async () => {
    await page.click('text=CreateAdd row');
    await page.waitForTimeout(2000);
    await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(1)')
      .click();
    await writeInTable('7', 3, 0);

    const row3 = await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(1)')
      .textContent();

    expect(row3).toBe('7');
  });

  it('can add a new column', async () => {
    await page.waitForTimeout(2000);
    await page.click('th button:has-text("Create")');
    await page.waitForTimeout(2000);
    await writeInTable('Y', 0, 1);
    await writeInTable('2020-01-01', 1, 1);
    await writeInTable('2020-02-01', 2, 1);
    await writeInTable('2020-03-01', 3, 1);

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(2)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(2)')
      .textContent();
    const row3 = await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(2)')
      .textContent();

    expect(row1).toBe('2020-01-01');
    expect(row2).toBe('2020-02-01');
    expect(row3).toBe('2020-03-01');
  });

  it('can change column type to a formula', async () => {
    await page.click('th:nth-child(4) button:has-text("Caret down")');
    await page.press('[role="menuitem"]:has-text("Change type")', 'Enter');
    await page.press('[role="menuitem"]:has-text("Formula")', 'Enter');

    const codeBlock = await page.waitForSelector('section:has-text("=")');
    const codeBlockText = await codeBlock.innerText();

    expect(codeBlockText).toContain('Column4 =');
  });

  it('focused on formula', async () => {
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

    const codeBlock = await page.waitForSelector('section:has-text("=")');
    const codeBlockText = await codeBlock.innerText();
    expect(codeBlockText).toBe('Column4 = 1 + 1');

    await waitForExpect(async () => {
      const cell = await page
        .locator('table > tbody > tr:nth-child(1) > td:nth-child(4)')
        .textContent();

      expect(cell?.trim()).toBe('2');
    });
  });

  it.todo('has more meaningful css selectors');
  it.todo('can change type to incompatible type');
  it.todo('cannot create a variable named `B`');
  it.todo('can apply the function `sum` to a thing typed as number');
  it.todo('can delete a column');
});
