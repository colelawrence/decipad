import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  createCodeLineV2Below,
  getCodeLineV2VarName,
  getCodeV2CodeContainers,
  getResult,
  getResults,
} from '../utils/page/Block';
import { keyPress, setUp, waitForEditorToLoad } from '../utils/page/Editor';

// eslint-disable-next-line playwright/no-skipped-test
test.describe('Calculation Blocks v2', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  let lineNo = -1;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
    lineNo = -1;
    await setUp(
      { page, context },
      {
        showChecklist: false,
        featureFlags: { CODE_LINE_NAME_SEPARATED: true },
      }
    );
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Calculates 1 + 1', async () => {
    await createCodeLineV2Below(page, 'Name1', '1 + 1');
    lineNo += 1;

    await expect(async () => {
      const result = await getResult(page, lineNo);
      expect(await result.allTextContents()).toMatchObject([
        expect.stringMatching(/2/i),
      ]);

      await expect(getCodeLineV2VarName(page, lineNo)).toHaveText(/Name1/);
    }).toPass();
  });

  test('Ensures variable name is unique', async () => {
    await createCodeLineV2Below(page, 'Name2', '1 + 1');
    lineNo += 1;

    await expect(getCodeLineV2VarName(page, lineNo)).toHaveText(/Name2/);

    await page.click(
      '[data-slate-editor] [data-testid="codeline-varname"] >> nth=-1'
    );
    await keyPress(page, 'End');
    await keyPress(page, 'Backspace');
    await page.keyboard.type('1');

    // Not done editing, name is invalid and it's "Name1"
    await expect(getCodeLineV2VarName(page, lineNo)).toHaveText(/Name1/);

    // Blur the variable name to make it realize the name is bad
    await keyPress(page, 'ArrowDown');

    await expect(getCodeLineV2VarName(page, lineNo)).toHaveText(/Name2/);
  });

  test('Ensures variable name is not empty', async () => {
    await expect(getCodeLineV2VarName(page, lineNo)).toHaveText(/Name2/);

    await getCodeLineV2VarName(page, lineNo).dblclick();
    await keyPress(page, 'Backspace');

    await expect(getCodeLineV2VarName(page, lineNo)).not.toHaveText(/Name2/);

    // Blur it so it auto-fills some name into it
    await keyPress(page, 'ArrowDown');

    await expect(getCodeLineV2VarName(page, lineNo)).toHaveText(/Name2/);
  });

  test('supports smartrefs', async () => {
    await createCodeLineV2Below(page, 'Name3', '100 + Name1 ');
    lineNo += 1;

    await expect(page.locator('[data-testid="smart-ref"]')).toHaveText(/Name1/);

    await expect(async () => {
      const result = await getResult(page, lineNo);
      expect(await result.allTextContents()).toMatchObject([
        expect.stringMatching(/102/i),
      ]);
    }).toPass();
  });

  test('lets you delete smartrefs', async () => {
    await keyPress(page, 'Backspace');
    await keyPress(page, 'Backspace');

    // "Name1" is selected and exists
    await expect(page.locator('[data-testid="smart-ref"]')).toBeVisible();

    await keyPress(page, 'Backspace');

    // "Name1" was DECIMATED
    await expect(page.locator('[data-testid="smart-ref"]')).toBeHidden();
  });

  test('lets you drag results into code lines and paragraphs', async () => {
    await createCodeLineV2Below(page, 'DragMe', '555');
    lineNo += 1;
    const dragLineNo = lineNo;

    await createCodeLineV2Below(page, 'DropMe', '');
    lineNo += 1;
    const dropLineNo = lineNo;

    await (
      await getResults(page).nth(dragLineNo)
    ).dragTo(getCodeV2CodeContainers(page).nth(dropLineNo));

    // Drag origin and drop target have 555! yay
    await expect(getResults(page).nth(dragLineNo)).toHaveText(/555/);
    await expect(getResults(page).nth(dropLineNo)).toHaveText(/555/);

    // Drag into a paragraph -> creates a magic number
    await (
      await getResults(page).nth(dragLineNo)
    ).dragTo(page.locator('[data-slate-editor] p >> nth=-1'));

    await expect(
      page.locator('p [data-testid="number-result:555"]')
    ).toBeVisible();
  });
});
