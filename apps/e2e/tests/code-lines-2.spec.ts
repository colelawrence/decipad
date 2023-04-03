import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  createCodeLineV2Below,
  getCodeLineContent,
  getCodeLineV2VarName,
  getResult,
} from '../utils/page/Block';
import { keyPress, setUp, waitForEditorToLoad } from '../utils/page/Editor';

// eslint-disable-next-line playwright/no-skipped-test
test.describe.skip('Calculation Blocks v2', () => {
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
        featureFlags: { CODE_LINE_NAME_SEPARATED: true },
      }
    );
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  const detectedType = 'FormulaNumber';

  test('Calculates 1 + 1', async () => {
    const lineText = '1 + 1';
    await keyPress(page, 'ArrowDown');
    await createCodeLineV2Below(page, 'MyVariable', lineText);

    lineNo += 1;

    const result = await getResult(page, lineNo);
    expect(await result.allTextContents()).toMatchObject([
      expect.stringMatching(/2/i),
    ]);

    const line = await getCodeLineContent(page, lineNo);
    expect(line).toBe(`${detectedType}MyVariable=`);

    expect(await getCodeLineV2VarName(page, lineNo)).toMatch(/MyVariable/);
  });

  test('Ensures variable name is unique', async () => {
    lineNo += 1;

    await createCodeLineV2Below(page, 'MyVariable', '');

    expect(await getCodeLineV2VarName(page, lineNo)).not.toMatch(/MyVariable/);
  });
});
