import { createCalculationBlockBelow } from './page-utils/Block';
import { keyPress, setUp, waitForEditorToLoad } from './page-utils/Pad';
import { cleanText, timeout } from './utils';

describe('normalize smart refs', () => {
  beforeAll(setUp);
  beforeAll(waitForEditorToLoad);

  it('replaces variable name with smart ref', async () => {
    await createCalculationBlockBelow('var = 10');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow('x = var ');
    const smartRef = await page.waitForSelector(
      'span[data-slate-node="element"]'
    );
    const text = await smartRef.textContent();
    expect(cleanText(text)).toBe('var');
  });

  it('does not replace variable name with smart ref if selected', async () => {
    const srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(1); // from previous test
    await createCalculationBlockBelow('y = var');
    const newSrCount = (await page.$$('span[data-slate-node="element"]'))
      .length;
    expect(newSrCount).toBe(1); // no new smart refs
  });
});

describe('smart refs in code tables', () => {
  beforeAll(setUp);
  beforeAll(waitForEditorToLoad);

  it('no infinite loops on code table column declaration', async () => {
    await createCalculationBlockBelow('A = 5');
    await page.keyboard.press('Enter');

    await createCalculationBlockBelow('Tab = {Col1 = A, Col2 = A}');
    await page.keyboard.press('Enter');

    await timeout(10000);

    const srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(2);
  });

  it('no highlight in column declarations in code tables', async () => {
    const srCount = (await page.$$('code [data-state="closed"]')).length; // var decorations
    expect(srCount).toMatchInlineSnapshot(`4`);
  });
});

describe('deleting smart refs', () => {
  beforeAll(setUp);
  beforeAll(waitForEditorToLoad);

  it('selects, then deletes smart ref on Backspace', async () => {
    let srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(0);

    await createCalculationBlockBelow('var = 10');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow('x = var ');
    srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(1);

    await keyPress('Backspace'); // space
    await keyPress('Backspace'); // select smart ref
    srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(1);

    await keyPress('Backspace'); // delete smart ref
    srCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(srCount).toBe(0);
  });

  it('selects, then deletes smart ref on Delete', async () => {
    const srCount = (await page.$$('span[data-slate-node="element"]')).length;

    await createCalculationBlockBelow('var2 = 10');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow('var2 ');
    let newSrCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(newSrCount).toBe(srCount + 1);

    await keyPress('ArrowUp');
    await keyPress('ArrowRight'); // we're now at the start of the line
    await keyPress('Delete'); // select smart ref

    newSrCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(newSrCount).toBe(srCount + 1); // did not delete

    await keyPress('Delete'); // delete smart ref
    newSrCount = (await page.$$('span[data-slate-node="element"]')).length;
    expect(newSrCount).toBe(srCount);
  });
});
