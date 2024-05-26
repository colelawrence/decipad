import { expect, test } from './manager/decipad-tests';
import { cleanText } from '../utils/src';

test('SmartRefs simple case', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('replaces variable name with smart ref', async () => {
    await notebook.addAdvancedFormula('var = 10');
    await notebook.addAdvancedFormula('x = var ');
    await expect(page.locator('span[data-slate-node="element"]')).toContainText(
      'var'
    );
  });

  await test.step('does not replace variable name with smart ref if selected', async () => {
    await notebook.addAdvancedFormula('y = var');
    await expect(
      page.locator('span[data-slate-node="element"]'),
      'new smart refs were added'
    ).toHaveCount(1);
  });
});

test('SmartRefs in low code tables', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.addTable();
  await notebook.selectLastParagraph();
  await notebook.addAdvancedFormula('x = Table.Column1');
  await page.keyboard.press('Enter');
  await page.getByTestId('smart-ref').getByText('Column1').waitFor();
  const text = await page.getByTestId('smart-ref').textContent();
  expect(cleanText(text)).toContain('Column1');
  expect(cleanText(text)).toContain('Table');
});

test('SmartRefs in code tables', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('no infinite loops on code table column declaration', async () => {
    await notebook.addAdvancedFormula('A = 5');
    await notebook.addAdvancedFormula('Tab = {Col1 = A, Col2 = A}');
    await expect(
      page.locator('span[data-slate-node="element"]'),
      'The notebook doesnt have the 2 expected advanced formulas'
    ).toHaveCount(2);
  });

  await test.step('no highlight in column declarations in code tables', async () => {
    // var decorations
    await expect(page.locator('code [data-state="closed"]')).toHaveCount(11);
  });
});

test('Deleting SmartRefs', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('selects, then deletes smart ref on Backspace', async () => {
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      0
    );
    await notebook.addAdvancedFormula('var = 10');
    await notebook.addAdvancedFormula('x = var ');

    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );
    await page.keyboard.press('Backspace'); // space
    await page.keyboard.press('Backspace'); // select smart ref
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );

    await page.keyboard.press('Backspace'); // delete smart ref
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      0
    );
  });

  await test.step('selects, then deletes smart ref on Delete', async () => {
    await notebook.addAdvancedFormula('var2 = 10');
    await notebook.addParagraph(' ');
    await notebook.addAdvancedFormula('var2 ');
    await expect(page.locator('span[data-slate-node="element"]')).toHaveCount(
      1
    );

    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight'); // we're now at the start of the line
    await page.keyboard.press('Delete'); // select smart ref

    await expect(
      page.locator('span[data-slate-node="element"]'),
      'smart ref was deleted'
    ).toHaveCount(1);

    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    await expect(
      page.locator('span[data-slate-node="element"]'),
      "smart ref wasn't deleted"
    ).toHaveCount(0);
  });
});
