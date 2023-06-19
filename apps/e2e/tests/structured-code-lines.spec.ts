import { BrowserContext, expect, Page, test } from '@playwright/test';
import {
  createCodeLineV2Below,
  getCodeV2CodeContainers,
} from '../utils/page/Block';
import { keyPress, setUp, waitForEditorToLoad } from '../utils/page/Editor';
import { getClearText, Timeouts } from '../utils/src';

// eslint-disable-next-line playwright/no-skipped-test
test.describe('Calculation Blocks v2', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = await page.context();
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

  test('Calculates 1 + 1', async () => {
    await createCodeLineV2Below(page, 'Name', '1 + 1');
    await page.waitForSelector('[data-testid="number-result:2"]');
    await expect(
      await page.locator('[data-testid="codeline-varname"]').textContent()
    ).toContain('Name');
  });

  test('Ensures variable name is unique', async () => {
    await createCodeLineV2Below(page, 'Name1', '1 + 1');

    await expect(
      await page
        .locator('[data-testid="codeline-varname"]')
        .nth(1)
        .textContent()
    ).toContain('Name');

    await page.locator('[data-testid="codeline-varname"]').nth(1).click();
    await keyPress(page, 'End');
    await keyPress(page, 'Backspace');

    await expect(
      await page
        .locator('[data-testid="codeline-varname"]')
        .nth(1)
        .textContent()
    ).toContain('Name');

    await keyPress(page, 'Tab');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    const innerText = await page.evaluate(
      getClearText,
      await page.locator('[data-testid="codeline-varname"]').nth(1).innerHTML()
    );
    await expect(innerText).toContain('Name2');
  });

  let generatedVarName;

  test('Ensures variable name is not empty', async () => {
    await page.locator('[data-testid="codeline-varname"]').nth(1).dblclick();
    await keyPress(page, 'Backspace');

    const innerText = await page.evaluate(
      getClearText,
      await page.locator('[data-testid="codeline-varname"]').nth(1).innerHTML()
    );

    await expect(innerText).not.toContain('Name2');

    // Blur it so it auto-fills some name into it
    await keyPress(page, 'Tab');
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    generatedVarName = await page.evaluate(
      getClearText,
      await page.locator('[data-testid="codeline-varname"]').nth(1).innerHTML()
    );

    await expect(
      await page
        .locator('[data-testid="codeline-varname"]')
        .nth(1)
        .textContent()
    ).toMatch(/[a-zA-Z_$][a-zA-Z0-9_$]*/);
  });

  test('supports smartrefs', async () => {
    await createCodeLineV2Below(page, 'Name3', `100 + ${generatedVarName} `);

    await expect(page.locator('[data-testid="smart-ref"]')).toHaveText(
      generatedVarName
    );

    await page.waitForSelector('[data-testid="number-result:102"]');
  });

  test('lets you delete smartrefs', async () => {
    await keyPress(page, 'Backspace');
    await keyPress(page, 'Backspace');

    // "Name2" is selected and exists
    await expect(page.locator('[data-testid="smart-ref"]')).toBeVisible();

    await keyPress(page, 'Backspace');

    // "Name2" was DECIMATED
    await expect(page.locator('[data-testid="smart-ref"]')).toBeHidden();
  });

  test('lets you drag results into code lines and paragraphs', async () => {
    await createCodeLineV2Below(page, 'DragMe', '555 + 5');

    await createCodeLineV2Below(page, 'DropMe', '2');

    await page.waitForSelector('[data-testid="number-result:560"]');

    const original = page.getByRole('textbox').getByTestId('number-result:560');

    await original.dragTo(page.getByTestId('codeline-code').nth(4));
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    // Drag origin and drop target have 2 * DragMe ! yay
    await expect(
      (
        await page.getByRole('textbox').getByTestId('number-result:1,120').all()
      ).length
    ).toBe(1);

    // Drag into a paragraph -> creates a magic number
    await original.dragTo(
      page.locator('[data-testid="paragraph-wrapper"] >> nth=-1')
    );

    await expect(
      page.locator(
        '[data-testid="paragraph-wrapper"] [data-testid="number-result:560"]'
      )
    ).toBeVisible();
  });

  test('applies unit from unit picker', async () => {
    await createCodeLineV2Below(page, 'Units', '100');

    await page.locator('[data-testid="unit-picker-button"] >> nth=-1').click();
    await page.locator('[data-testid="unit-picker-percentage"]').click();

    await expect(getCodeV2CodeContainers(page).nth(5)).toHaveText(/100%/);
  });

  test('changing unit changes the text of the codeline', async () => {
    await page.locator('[data-testid="unit-picker-button"] >> nth=-1').click();
    await page.locator('[data-testid="unit-picker-Weight"]').click();
    await page.locator('[data-testid="unit-picker-Weight-kilogram"]').click();

    await expect(getCodeV2CodeContainers(page).nth(5)).toHaveText(/kilogram/);
  });
});
