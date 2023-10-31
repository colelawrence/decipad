import { BrowserContext, expect, Page, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import {
  codePlaceholders,
  createWorkspace,
  getClearText,
  Timeouts,
  snapshot,
} from '../utils/src';

import { createWithSlashCommand } from '../utils/page/Block';

const executeCode = (page: Page, sourcecode: string, x: number) =>
  test.step(`Executing ${x}`, async () => {
    await page.getByTestId('paragraph-content').last().fill('/i');
    await page
      .locator('article')
      .getByTestId('menu-item-open-integration')
      .waitFor();
    await page
      .locator('article')
      .getByTestId('menu-item-open-integration')
      .click();
    await page.getByTestId('select-integration:Code').click();

    // First line of the CodeMirror
    await page
      .getByTestId('code-mirror')
      .getByRole('textbox')
      .locator('div')
      .first()
      .fill(sourcecode);

    await snapshot(page, 'Notebook: Js Code Editor', {
      mobile: false,
    });

    await page.getByTestId('text-icon-button:Run').click();
    await expect(page.getByTestId('code-successfully-run')).toBeVisible();
    await page.getByTestId('integration-modal-continue').click();

    const generatedVarName = await page.evaluate(
      getClearText,
      await page.getByTestId('result-preview-input').innerHTML()
    );

    await page
      .getByTestId('result-preview-input')
      .getByText(generatedVarName)
      .dblclick();
    await page.keyboard.press('Backspace');
    await page.keyboard.type(String.fromCharCode(x + 65));
    await page.getByTestId('integration-modal-continue').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);

    // Making a formula to test them
    await page
      .locator('article')
      .getByTestId('paragraph-content')
      .last()
      .fill('/');
    await page
      .locator('article')
      .getByTestId('menu-item-calculation-block')
      .waitFor();
    await page
      .locator('article')
      .getByTestId('menu-item-calculation-block')
      .click();
    await page
      .getByTestId('code-line')
      .last()
      .fill(String.fromCharCode(x + 65));
    await page
      .getByTestId('auto-complete-variable-drawer')
      .getByText(String.fromCharCode(x + 65), { exact: true })
      .last()
      .click();
    await expect(page.getByTitle('Error')).toBeHidden();
  });

test.describe('Make sure our js code templates work', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Checks all the files', async () => {
    const allSources = codePlaceholders;

    expect(allSources.length).toBeGreaterThan(0);
    for (const [i, sourcecode] of allSources.entries()) {
      await executeCode(page, sourcecode, i);
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.liveBlockDelay);
    }
  });

  test('Adding a duplicate to make sure it is not allowed', async () => {
    const allSources = codePlaceholders;
    await executeCode(
      page,
      allSources[allSources.length - 1],
      allSources.length - 1
    );
    await expect(
      page.locator('span').filter({ hasText: 'Warning' }).nth(2)
    ).toBeVisible();
  });
});

test.describe('More JS codeblock checks', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  let generatedVarName: string;

  test('Create a variable', async () => {
    await page.getByTestId('paragraph-content').last().click();
    await page.keyboard.press('=');

    await page
      .locator('[data-slate-editor]')
      .getByTestId('codeline-varname')
      .waitFor();

    generatedVarName = await page.evaluate(
      getClearText,
      await page.getByTestId('codeline-varname').nth(0).innerHTML()
    );

    await expect(
      await page.getByTestId('codeline-varname').nth(0).textContent()
    ).toMatch(/[a-zA-Z_$][a-zA-Z0-9_$]*/);
  });

  test('Checks if the variable is accessible inside of the notebook', async () => {
    const code = `
// returns variable ${generatedVarName}
return this.${generatedVarName};`;
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await page.getByTestId('paragraph-content').last().fill('/');
    await page.getByTestId('menu-item-open-integration').first().waitFor();
    await page.getByTestId('menu-item-open-integration').first().click();
    await page.getByTestId('select-integration:Code').click();

    // First line of the CodeMirror
    await page
      .getByTestId('code-mirror')
      .getByRole('textbox')
      .locator('div')
      .first()
      .fill(code);

    await page.getByTestId('text-icon-button:Run').click();

    await expect(page.getByTestId('code-successfully-run')).toBeVisible();
    await page.getByTestId('integration-modal-continue').click();

    await expect(page.getByTestId('number-result:100')).toBeVisible();

    await page.getByTestId('integration-modal-continue').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);
  });
});

test.describe('Import Menu', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('screenshots the import menu', async () => {
    await page.getByTestId('paragraph-content').last().click();
    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/t');
    await expect(
      page.locator('article').getByTestId('menu-item-table')
    ).toBeVisible();
    await expect(page.getByTestId('paragraph-wrapper')).toHaveCount(3);
    await page.keyboard.press('Backspace');
    await page.keyboard.type('integrations');
    await page.keyboard.press('Enter');
    await snapshot(page as Page, 'Notebook: Import Menu');
    await page.keyboard.press('Backspace');
  });
});

test.describe('Checks the ability to change the unit of a response', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Checks the ability to change the unit of a response', async () => {
    const allSources = codePlaceholders;
    expect(allSources.length).toBeGreaterThan(0);

    await createWithSlashCommand(page, '/integrations');
    await page.getByTestId('select-integration:Code').click();

    // First line of the CodeMirror
    await page
      .getByTestId('code-mirror')
      .getByRole('textbox')
      .locator('div')
      .first()
      .fill(allSources[5]);

    await page.getByTestId('text-icon-button:Run').click();
    await expect(page.getByTestId('code-successfully-run')).toBeVisible();
    await page.getByTestId('integration-modal-continue').click();

    const generatedVarName = await page.evaluate(
      getClearText,
      await page.getByTestId('result-preview-input').innerHTML()
    );

    await page
      .getByTestId('result-preview-input')
      .getByText(generatedVarName)
      .dblclick();
    await page.keyboard.press('Backspace');
    await page.keyboard.type('F');

    // The column menu button for the API response
    await page
      .getByRole('cell', { name: 'value' })
      .getByTestId('table-column-menu-button')
      .click();

    await page.getByRole('menuitem').getByText('Number').nth(1).click();

    await page.getByTestId('integration-modal-continue').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);
  });
});
