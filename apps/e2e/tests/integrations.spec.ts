import { Page, expect, test } from './manager/decipad-tests';
import {
  codePlaceholders,
  getClearText,
  Timeouts,
  snapshot,
} from '../utils/src';
import { ControlPlus } from '../utils/page/Editor';

const executeCode = (page: Page, sourcecode: string, x: number) =>
  test.step(`Executing ${x}`, async () => {
    await page.getByTestId('paragraph-content').last().click();
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
      .click();
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

test('Make sure our js code templates work', async ({ testUser }) => {
  const { page } = testUser;

  await test.step('Checks all the files', async () => {
    const allSources = codePlaceholders;

    expect(allSources.length).toBeGreaterThan(0);
    for (const [i, sourcecode] of allSources.entries()) {
      await executeCode(page, sourcecode, i);
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.liveBlockDelay);
    }
  });

  await test.step('Adding a duplicate to make sure it is not allowed', async () => {
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

test('More JS codeblock checks', async ({ testUser }) => {
  const { page, notebook } = testUser;

  let generatedVarName: string;

  await test.step('Create a variable', async () => {
    await notebook.waitForEditorToLoad();
    await notebook.focusOnBody();
    await notebook.selectLastParagraph();
    await page.keyboard.press('Enter');
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

  await test.step('Checks if the variable is accessible inside of the notebook', async () => {
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

test('screenshots the import menu', async ({ testUser }) => {
  const { page } = testUser;
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

test('Checks the ability to change the unit of a response', async ({
  testUser,
}) => {
  const { page, notebook } = testUser;
  const allSources = codePlaceholders;
  expect(allSources.length).toBeGreaterThan(0);

  await notebook.addBlockSlashCommand('open-integration');
  await await page.getByTestId('select-integration:Code').click();

  // First line of the CodeMirror
  await page
    .getByTestId('code-mirror')
    .getByRole('textbox')
    .locator('div')
    .first()
    .fill(allSources[4]);
  // .fill(allSources[5]);
  // Uncomment when the last source is back online (opentdb.com)

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

test('Check sql integrations is working correctly', async ({ testUser }) => {
  let notebookURL: string;

  await test.step('create integration', async () => {
    await testUser.notebook.addBlock('open-integration');
    notebookURL = testUser.page.url();
    await testUser.page.getByTestId('select-integration:SQL').click();
    await testUser.page.getByText('Add SQL Connection').click();
    await testUser.page.getByRole('menuitem', { name: /SQL/ }).click();
    await testUser.page
      .getByRole('button', { name: 'Add a New Connection' })
      .waitFor();
    await testUser.page
      .getByRole('button', { name: 'Add a New Connection' })
      .click();
    await testUser.page
      .getByPlaceholder('SQL #')
      .fill('Planet Scale Intergration');
    await testUser.page
      .getByPlaceholder('mysql://user:password@host.')
      .fill(process.env.TEST_DATABASE!);

    await testUser.page
      .getByRole('button', { name: 'Test Connection' })
      .click();
    await expect(testUser.page.getByText('Connection Worked')).toBeVisible();
    await testUser.page.getByTestId('add-conn-button').click();
  });

  await test.step('write query', async () => {
    await testUser.page.goto(notebookURL);
    await testUser.notebook.waitForEditorToLoad();
    await testUser.notebook.addBlock('open-integration');
    await testUser.page.getByTestId('select-integration:SQL').click();
    await testUser.page.getByText('Add SQL Connection').click();
    await testUser.page.getByText('Planet Scale Intergration').first().click();
    await testUser.page.getByTestId('code-mirror').click();

    await testUser.page
      .getByRole('textbox')
      .fill('select text, number from e2e_test_data_table;');
    await testUser.page.getByRole('button', { name: 'Play Run' }).click();
    await testUser.page.getByRole('tab', { name: 'Preview' }).click();
  });

  await test.step('check table data', async () => {
    await Promise.all([
      expect(
        testUser.page.locator('div').filter({ hasText: /^1$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^one$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^10$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^ten$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^11$/ })
      ).toBeHidden(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^eleven$/ })
      ).toBeHidden(),
      expect(
        testUser.page.getByText('15 rows, previewing rows 1 to 10')
      ).toBeVisible(),
    ]);

    testUser.page.getByRole('button', { name: 'Go to page' }).nth(1).click();

    await Promise.all([
      expect(
        testUser.page.locator('div').filter({ hasText: /^1$/ })
      ).toBeHidden(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^one$/ })
      ).toBeHidden(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^11$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^eleven$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^15$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^fifteen$/ })
      ).toBeVisible(),
      expect(
        testUser.page.getByText('15 rows, previewing rows 11 to 15')
      ).toBeVisible(),
    ]);
  });
});

test('Checks copy link to block integrations', async ({ testUser }) => {
  const { page, notebook, workspace } = testUser;
  const SourceName = 'Source';
  const SourceValue = '$400';
  let SourceNotebookURL: string;
  let IntegrationNotebookURL: string;

  await test.step('create source variable and get its url reference', async () => {
    SourceNotebookURL = await notebook.publishNotebook();
    await notebook.focusOnBody();
    await notebook.addFormula(SourceName, SourceValue);
    await notebook.copyBlockReference(0);
  });

  await test.step('checks can add reference to formula in another notebook', async () => {
    await page.getByTestId('go-to-workspace').click();
    await workspace.createNewNotebook();
    await testUser.aiAssistant.closePannel();
    await notebook.waitForEditorToLoad();
    IntegrationNotebookURL = page.url();
    await notebook.selectLastParagraph();
    await ControlPlus(testUser.page, 'V');
    await page.getByText('Decipad notebook Integration').click();
    await expect(async () => {
      await expect(
        page.getByTestId('live-code').getByTestId('loading-animation').first()
      ).toBeHidden();
    }).toPass({
      timeout: 1000,
    });
    await page
      .getByTestId('integration-block')
      .filter({ hasText: /Variable/ })
      .getByTestId('segment-button-trigger')
      .click();
    await expect(page.getByText(SourceValue)).toBeVisible();
  });

  await test.step('checks we can update original reference and it propagates', async () => {
    await page.goto(SourceNotebookURL);
    await notebook.waitForEditorToLoad();

    await notebook.focusOnBody();
    await page
      .getByTestId('code-line-expression')
      .getByText(SourceValue)
      .dblclick();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await page.keyboard.press('Delete');
    await page.keyboard.type('500');
    await notebook.publishNotebookChanges();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.goto(IntegrationNotebookURL);
    await testUser.aiAssistant.closePannel();
    await notebook.waitForEditorToLoad();

    await notebook.focusOnBody();
    await expect(async () => {
      await expect(
        page.getByTestId('live-code').getByTestId('loading-animation').first()
      ).toBeHidden();
    }).toPass({
      timeout: 1000,
    });
    await page
      .getByTestId('integration-block')
      .filter({ hasText: /Variable/ })
      .getByTestId('segment-button-trigger')
      .click();
    await expect(page.getByText('$500')).toBeVisible();
  });

  await test.step('checks connection doesnt have retry error after notebook refresh', async () => {
    await page.reload();
    await testUser.aiAssistant.closePannel();
    await notebook.waitForEditorToLoad();
    await expect(async () => {
      await expect(
        page.getByTestId('live-code').getByTestId('loading-animation').first()
      ).toBeHidden();
    }).toPass({
      timeout: 1000,
    });
    await notebook.focusOnBody();
    await page
      .getByTestId('integration-block')
      .filter({ hasText: /Variable/ })
      .getByTestId('segment-button-trigger')
      .click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.maxSelectorWaitTime);

    await expect(
      page.getByTestId('code-line-warning'),
      'Live connection setup with a retry error'
    ).toBeHidden();
    await expect(
      page.getByText('Retry'),
      'Live connection setup with a retry error'
    ).toBeHidden();
  });
});
