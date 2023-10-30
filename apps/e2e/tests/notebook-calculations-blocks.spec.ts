import { Page, expect, test } from '@playwright/test';
import { PlaywrightManagerFactory } from './manager';
import { getClearText, snapshot, Timeouts } from '../utils/src';
import { keyPress } from '../utils/page/Editor';
import { getResult } from '../utils/page/Block';

test.describe('structured input and calculations @calculation-blocks', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('advanced calculation blocks (old codelines) @advanced-formulas', async ({
    page,
  }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await test.step('calculates 1 + 1', async () => {
      await manager.AdvancedCalc.Create('1 + 1');
      await expect(
        page.getByTestId('code-line').last().getByTestId('number-result:2')
      ).toBeVisible();
    });

    await test.step('creates variable', async () => {
      await manager.AdvancedCalc.Create('MyVar = 68 + 1');
      await expect(
        page.getByTestId('code-line').last().getByTestId('number-result:69')
      ).toBeVisible();
    });

    await test.step('opens autocomplete menu for incomplete variable expressions', async () => {
      await manager.AdvancedCalc.Create('NewVar = 1 + My');
      await expect(page.getByTestId('autocomplete-tooltip')).toBeVisible();
      // Wait for result to appear. Avoids flaky snapshots.
      await page
        .getByTestId('autocomplete-group:Variables')
        .getByText('MyVar')
        .waitFor();
      await snapshot(page as Page, 'Auto Complete Menu: Open');
    });

    await test.step('completes variable with autocomplete', async () => {
      await expect(
        page.getByTestId('autocomplete-group:Variables').getByText('MyVar')
      ).toBeVisible();
      await page
        .getByTestId('autocomplete-group:Variables')
        .getByText('MyVar')
        .click();
      await expect(
        page.getByTestId('code-line').last().getByTestId('number-result:70')
      ).toBeVisible();
      await expect(
        page.getByTestId('code-line').getByText('MyVar')
      ).toHaveCount(2);
    });

    await test.step('enter does a soft break inside parentesis', async () => {
      const lineText = '(10 + 2)';
      await page.keyboard.press('ArrowDown');
      await manager.AdvancedCalc.Create(lineText);

      const lineBefore = await manager.AdvancedCalc.GetNthText(-1);
      expect(lineBefore).toContain(lineText);

      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Enter');

      const [left, right] = [lineText.slice(0, -2), lineText.slice(-2)];
      const brokenLine = `${left}\n${right}`;

      const lineAfter = await manager.AdvancedCalc.GetNthText(-1);
      expect(lineAfter).toContain(brokenLine);
      await expect(
        page.getByTestId('code-line').last().getByTestId('number-result:12')
      ).toBeVisible();
    });

    await test.step('enter moves caret to the end', async () => {
      const lineText = '3 + 7';
      await page.keyboard.press('ArrowDown');
      await manager.AdvancedCalc.Create(lineText);

      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');

      const caretBefore = await manager.GetCaretPosition();

      await page.keyboard.press('Enter');

      const caretAfter = await manager.GetCaretPosition();
      expect(caretBefore).toBeDefined();
      expect(caretAfter).toBe(caretBefore! + 2);
      await expect(
        page.getByTestId('code-line').last().getByTestId('number-result:10')
      ).toBeVisible();
    });

    await test.step('shift+enter adds new advanced formula below', async () => {
      const lineText = 'a = 15';
      await page.keyboard.press('ArrowDown');
      await manager.AdvancedCalc.Create(lineText);

      const advancedCalculations = await page.getByTestId('code-line').count();
      await page.keyboard.press('Shift+Enter');
      await expect(page.getByTestId('code-line')).toHaveCount(
        advancedCalculations + 1
      );
      await expect(
        page.getByTestId('code-line').getByTestId('number-result:15')
      ).toBeVisible();
    });

    await test.step(`can't reuse variable names`, async () => {
      await manager.AdvancedCalc.Create('variable  = 2');
      await manager.AdvancedCalc.Create('variable  = 5');
      await expect(page.getByTestId('code-line-warning')).toBeVisible();
    });
  });

  test('numbers and formula blocks (Structured Input) @formulas', async ({
    page,
  }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();
    let generatedVarName: string;

    await test.step('Calculates 1 + 1', async () => {
      await manager.StructuredInput.Create('MyVariable', '1 + 1');
      await expect(
        page
          .getByTestId('codeline-code')
          .last()
          .getByTestId('code-line-result:2')
      ).toBeVisible();
      expect(
        await page.getByTestId('codeline-varname').textContent()
      ).toContain('MyVariable');
    });

    await test.step('Ensures variable name is unique', async () => {
      await manager.StructuredInput.Create('MyVariable', ' ');
      await manager.SelectLastParagraph();
      // Expected behavior is that the codeline-code will turn MyVariable to MyVariable2
      await expect(
        page.getByText('MyVariable2', { exact: true })
      ).toBeVisible();
    });

    await test.step('Check precise result on hover', async () => {
      await manager.StructuredInput.Create('IrrationalNumber', 'pi');
      await expect(
        page.getByText('IrrationalNumber', { exact: true })
      ).toBeVisible();
      await page.getByTestId('number-result:≈3.14').hover();
      await expect(page.getByText('3.141592653589793')).toBeVisible();
    });

    await test.step('Ensures variable name is not empty', async () => {
      await page.getByTestId('codeline-varname').first().dblclick();
      await page.keyboard.press('Backspace');
      const innerText = await page.evaluate(
        getClearText,
        await page.getByTestId('codeline-varname').first().innerHTML()
      );

      expect(innerText).not.toContain('IrrationalNumber');

      // Blur it so it auto-fills some name into it
      await page.keyboard.press('Tab');
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);

      generatedVarName = await page.evaluate(
        getClearText,
        await page.getByTestId('codeline-varname').first().innerHTML()
      );

      expect(
        await page.getByTestId('codeline-varname').first().textContent()
      ).toMatch(/[a-zA-Z_$][a-zA-Z0-9_$]*/);
    });

    await test.step('supports smartrefs', async () => {
      await manager.StructuredInput.Create(
        'Name3',
        `100 + ${generatedVarName} `
      );
      await expect(page.getByTestId('number-result:102')).toBeVisible();
      await expect(page.getByTestId('smart-ref')).toHaveText(generatedVarName);
    });

    await test.step('lets you delete smartrefs', async () => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowRight');

      // Smartref selected
      await expect(page.getByTestId('smart-ref')).toBeVisible();
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');

      // check Smartref was deleted
      await expect(page.getByTestId('smart-ref')).toBeHidden();
    });

    await test.step('lets you drag results into code lines and paragraphs', async () => {
      await manager.StructuredInput.Create('DragMe', '555 + 5');
      await manager.StructuredInput.Create('DropMe', '2');
      await page.getByTestId('number-result:560').first().waitFor();

      const original = page
        .getByRole('textbox')
        .getByTestId('number-result:560');

      await original.dragTo(page.getByTestId('codeline-code').nth(-1));
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);

      // Drag origin and drop target have 2 * DragMe ! yay
      expect(
        (
          await page
            .getByRole('textbox')
            .getByTestId('number-result:1,120')
            .all()
        ).length
      ).toBe(1);

      // Drag into a paragraph -> creates a magic number
      await original.dragTo(page.getByTestId('paragraph-wrapper').last());

      await expect(
        page.getByTestId('paragraph-wrapper').getByTestId('number-result:560')
      ).toBeVisible();
    });

    await test.step('Renames smart-ref and name is reflected', async () => {
      await page.getByTestId('smart-ref').getByText('DragMe').waitFor();

      await page.getByText('DragMe').first().dblclick();

      await page.keyboard.type('DragMeRenamed');

      // How can we make this better...
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);

      await expect(page.getByText('DragMe', { exact: true })).toHaveCount(0);
      await expect(page.getByText('DragMeRenamed')).toHaveCount(2);
    });

    await test.step('applies unit from unit picker', async () => {
      await manager.StructuredInput.Create('Units', '100');

      await page.getByTestId('unit-picker-button').nth(-1).click();
      await page.getByTestId('unit-picker-percentage').click();

      expect(await manager.StructuredInput.GetNthText(-1)).toContain('100%');
    });

    await test.step('changing unit changes the text of the codeline', async () => {
      await page.getByTestId('unit-picker-button').nth(-1).click();
      await page.getByTestId('unit-picker-Weight').click();
      await page.getByTestId('unit-picker-Weight-kilogram').click();

      expect(await manager.StructuredInput.GetNthText(-1)).toContain(
        'kilogram'
      );
    });

    await test.step('check custom unit conversion', async () => {
      await manager.StructuredInput.Create('Euro', '$1.5');
      await manager.StructuredInput.Create('DolarToEuro', '$5 in Euro');

      await expect(
        page
          .getByTestId('codeline-code')
          .last()
          .getByTestId('number-result:≈3.33 €')
      ).toBeVisible();
    });

    await test.step('custom units', async () => {
      await manager.StructuredInput.Create('MyApples', '50');
      await manager.StructuredInput.UnitPicker.last().click();
      await manager.page.getByPlaceholder('add custom unit').click();

      // ensure the button is disabled if the user doesn't enter any unit
      await expect(page.getByTestId('advanced_unit_button')).toBeDisabled();
      await manager.page.keyboard.type('apples');

      // ensure the button is enabled if the user enters a valid unit
      await expect(page.getByTestId('advanced_unit_button')).toBeEnabled();

      await manager.page.getByText('Add new').click();

      await expect(
        page
          .getByTestId('codeline-code')
          .last()
          .getByTestId('number-result:50 apples')
      ).toBeVisible();
    });
  });

  test('inline formula inspector @formulas @inline-numbers', async ({
    page,
  }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    const lineNo = -1;

    await test.step('highlights a number while typing', async () => {
      await page.click('[data-testid="paragraph-content"]');
      await page.keyboard.type('We have bought 3');
      const potentialFormula = await manager.getFormulaInspectorContent();
      expect(potentialFormula).toEqual('3');
    });

    await test.step('editable when TAB pressed', async () => {
      await keyPress(page, 'Tab');
      // Wait for line to be floaty before we start editing
      await expect(
        page.locator('[data-testid="inline-formula-editor"]')
      ).toHaveText('3');
      await page.keyboard.type('+1');
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        const potentialFormula = await manager.getMagicNumberContent();
        expect(potentialFormula).toEqual('4');
      }).toPass();
    });

    await test.step('you can continue typing after pressing ENTER', async () => {
      await keyPress(page, 'Enter');
      await page.keyboard.type('tickets to Paris.');
      const potentialFormula = await manager.getMagicNumberContent();
      expect(potentialFormula).toEqual('4');
    });

    await test.step('result could be dragged out', async () => {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      const selector = '[data-type="paragraph"]:last-child';
      const lastParagraphNode = page.locator(selector);

      const resultEl = await getResult(page, lineNo);
      resultEl.dragTo(lastParagraphNode);
    });

    await test.step('second instance editable by click', async () => {
      await page
        .getByTestId('paragraph-content')
        .nth(1)
        .getByTestId('magic-number')
        .click();

      await page.waitForSelector('[data-testid="code-line-float"]');
      await page.keyboard.type('+1');
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        const potentialFormula = await manager.getMagicNumberContent();
        expect(potentialFormula).toEqual('5');
      }).toPass();
    });
  });
});
