import {
  createTable,
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
  writeInTable,
} from './page-utils/Pad';

describe('pad navigation', () => {
  beforeAll(goToPlayground);
  beforeAll(() => waitForEditorToLoad());

  it('creates a table', async () => {
    await page.keyboard.type('Should you buy a house?');
    await keyPress('Enter');
    await page.keyboard.type('Price is %Price');
    await page.keyboard.type('%');
    await keyPress('Enter');
    await page.keyboard.type('Fees = 500 gbp');
    expect(await page.$('[contenteditable] table')).toBe(null);

    await focusOnBody();
    await createTable();

    expect(await page.waitForSelector('[contenteditable] table')).not.toBe(
      null
    );
  });

  it('can fill a table', async () => {
    await writeInTable('Alice', 1);
    await writeInTable('Bernice', 2);
    await writeInTable('Claudia', 3);
    await writeInTable('1', 1, 1);
    await writeInTable('2', 2, 1);
    await writeInTable('3', 3, 1);

    const row1 = await page
      .locator('table > tbody > tr:nth-child(1) > td:nth-child(1)')
      .textContent();
    const row2 = await page
      .locator('table > tbody > tr:nth-child(2) > td:nth-child(1)')
      .textContent();
    const row3 = await page
      .locator('table > tbody > tr:nth-child(3) > td:nth-child(1)')
      .textContent();

    expect(row1).toBe('Alice');
    expect(row2).toBe('Bernice');
    expect(row3).toBe('Claudia');
  });

  it('goes all the way down to australia', async () => {
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await keyPress('Enter');
    await page.keyboard.type('Price = Fees + 300000 gbp');
    await keyPress('Enter');
    await page.keyboard.type('= Table1.Column1');
    expect(
      (await page.textContent('text=is 300,500 £'))!.trim()
    ).not.toBeNull();
    const magic = await page.locator('span[title="300500"]');
    await magic.scrollIntoViewIfNeeded();
    await magic.click();
    await expect(
      page.locator(`span[title="300500"] >> visible=false`)
    ).toBeTruthy();
  });

  it('works even when the variable is re-declared', async () => {
    const allDraggable = await page.$$('div[draggable="true"] button');
    const nrDraggable = allDraggable.length;
    const toDelete = allDraggable[nrDraggable - 3];
    await toDelete.click();
    const deleteButton = page.locator(`:nth-match(:text("Delete"), 2)`);
    await deleteButton.click();
    await keyPress('Enter');
    await page.keyboard.type('Price = 4200 gbp');
    await keyPress('Enter');
    expect((await page.textContent('text=is 4,200 £'))!.trim()).not.toBeNull();
    const magic = await page.locator('span[title="4200"]');
    await magic.scrollIntoViewIfNeeded();
    await magic.click();
    await expect(
      page.locator(`span[title="4200"] >> visible=false`)
    ).toBeTruthy();
  });
});
