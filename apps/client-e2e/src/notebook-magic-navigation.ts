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
    await createCalculationBlockBelow('Fees = 500 gbp');

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
    await page.keyboard.type('Price = Fees + 300000 gbp');
    expect((await page.textContent('text=is £300,500'))!.trim()).not.toBeNull();
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
    const toDelete = allDraggable[nrDraggable - 2];
    await toDelete.click();
    const deleteButton = page.locator(`:nth-match(:text("Delete"), 2)`);
    await deleteButton.click();
    await keyPress('Enter');
    await page.keyboard.type('Price = 4200 gbp');
    await keyPress('Enter');
    expect((await page.textContent('text=is £4,200'))!.trim()).not.toBeNull();
    const magic = await page.locator('span[title="4200"]');
    await magic.scrollIntoViewIfNeeded();
    await magic.click();
    await expect(
      page.locator(`span[title="4200"] >> visible=false`)
    ).toBeTruthy();
  });
});
