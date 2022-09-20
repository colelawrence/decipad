import { createCalculationBlockBelow } from './page-utils/Block';
import {
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from './page-utils/Pad';

describe('notebook navigation', () => {
  beforeAll(goToPlayground);
  beforeAll(() => waitForEditorToLoad());

  it('creates some text', async () => {
    await page.keyboard.type('Should you buy a house?');
    await keyPress('Enter');
    await page.keyboard.type('Price is %Price');
    await page.keyboard.type('%');
    await keyPress('Enter');
    await createCalculationBlockBelow('Fees = 5 gbp');

    expect(
      await page.waitForSelector('text=Should you buy a house?')
    ).toBeTruthy();
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
    await page.keyboard.type('Price = Fees + 30 gbp');
    expect((await page.textContent('text=is £35'))!.trim()).not.toBeNull();
    const magic = await page.locator('span[title="35"]');
    await magic.scrollIntoViewIfNeeded();
    await magic.click();
    await expect(
      page.locator(`span[title="35"] >> visible=false`)
    ).toBeTruthy();
  });

  it('works even when the variable is re-declared', async () => {
    const allDraggable = await page.$$(
      '[draggable="true"] [data-testid=drag-handle]'
    );
    const nrDraggable = allDraggable.length;
    const toDelete = allDraggable[nrDraggable - 3];
    await toDelete.click();
    const deleteButton = page.locator(`:nth-match(:text("Delete"), 2)`);
    await deleteButton.click();
    await keyPress('Enter');
    await page.keyboard.type('Price = 42 gbp');
    await keyPress('Enter');
    expect((await page.textContent('text=is £42'))!.trim()).not.toBeNull();
    const magic = await page.locator('span[title="42"]');
    await magic.scrollIntoViewIfNeeded();
    await magic.click();
    await expect(
      page.locator(`span[title="42"] >> visible=false`)
    ).toBeTruthy();
  });
});
