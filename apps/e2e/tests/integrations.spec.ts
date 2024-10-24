/* eslint-disable no-console */
/* eslint-disable playwright/no-conditional-in-test */
import type { Page } from './manager/decipad-tests';
import { expect, test } from './manager/decipad-tests';
import {
  codePlaceholders,
  getClearText,
  Timeouts,
  snapshot,
} from '../utils/src';
import os from 'node:os';
import type { User } from './manager/test-users';
import fs from 'fs';
import path from 'path';
import { getDefined } from '@decipad/utils';

const executeCode = (user: User, page: Page, sourcecode: string, x: number) =>
  test.step(`Executing ${x}`, async () => {
    await user.notebook.addBlockSlashCommand('open-integration', true);

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
    await page.getByText('Preview').last().click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await user.notebook.focusOnBody();
    await page
      .getByTestId('result-preview-input')
      .getByRole('textbox')
      .fill(String.fromCharCode(x + 65));
    await page.getByTestId('integration-modal-continue').click();

    // Making a formula to test them

    await user.notebook.addAdvancedFormula(String.fromCharCode(x + 65));
    await expect(page.getByTitle('Error')).toBeHidden();
  });

// eslint-disable-next-line playwright/no-skipped-test
test.skip('make sure our js code templates work', async ({
  randomFreeUser,
}) => {
  const { page, notebook, workspace } = randomFreeUser;

  await workspace.createNewNotebook();
  await randomFreeUser.aiAssistant.closePannel();
  await notebook.waitForEditorToLoad();
  await notebook.focusOnBody();

  await randomFreeUser.notebook.closeSidebar();

  await test.step('Checks all the files', async () => {
    const allSources = codePlaceholders;

    expect(allSources.length).toBeGreaterThan(0);
    for (const [i, sourcecode] of allSources.entries()) {
      await executeCode(randomFreeUser, page, sourcecode, i);
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.liveBlockDelay);
    }
  });

  await test.step('Adding a duplicate to make sure it is not allowed', async () => {
    const allSources = codePlaceholders;
    await executeCode(
      randomFreeUser,
      page,
      allSources[allSources.length - 1],
      allSources.length - 1
    );
    await expect(
      page.locator('span').filter({ hasText: 'Warning' }).first()
    ).toBeVisible();
  });
});

test('reuse variables in JS codeblock and duplicate integrations', async ({
  randomFreeUser,
}) => {
  const { page, notebook, workspace } = randomFreeUser;

  await workspace.createNewNotebook();
  await randomFreeUser.aiAssistant.closePannel();
  await notebook.waitForEditorToLoad();
  await notebook.focusOnBody();
  await randomFreeUser.notebook.closeSidebar();

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

    expect(
      await page.getByTestId('codeline-varname').nth(0).textContent()
    ).toMatch(/[a-zA-Z_$][a-zA-Z0-9_$]*/);
  });

  await test.step('Checks if the variable is accessible inside of the notebook', async () => {
    const code = `
// returns variable ${generatedVarName}
return this.${generatedVarName};`;
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await page.getByTestId('paragraph-content').last().click({ delay: 100 });

    await randomFreeUser.notebook.addBlockSlashCommand(
      'open-integration',
      true
    );

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
    await page.getByText('Preview').last().click();
    await expect(page.getByTestId('number-result:100')).toBeVisible();

    await page.getByText('Preview').last().click();
    await page.getByTestId('result-preview-input').click();
    await page.keyboard.press(
      os.platform() === 'darwin' ? 'Meta+a' : 'Control+a',
      { delay: Timeouts.typing }
    );
    await page.keyboard.press('Backspace', { delay: Timeouts.typing });
    await page.keyboard.type('MyCode', { delay: Timeouts.typing });
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);

    await page.getByTestId('integration-modal-continue').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.liveBlockDelay);
  });

  await test.step('Check duplicating works', async () => {
    await randomFreeUser.notebook.duplicateBlock(2);

    // 1 for MyCode, and another for MyCodeCopy
    await expect(page.getByText('MyCode', { exact: true })).toHaveCount(1);
    await expect(page.getByText('MyCodeCopy', { exact: true })).toHaveCount(1);
  });
});

test('screenshots the import menu', async ({ randomFreeUser }) => {
  const { page, notebook, workspace } = randomFreeUser;

  await workspace.createNewNotebook();
  await randomFreeUser.aiAssistant.closePannel();
  await notebook.waitForEditorToLoad();
  await notebook.focusOnBody();
  await randomFreeUser.notebook.closeSidebar();

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

test('checks the ability to change the unit of a response', async ({
  randomFreeUser,
}) => {
  const { page, notebook, workspace } = randomFreeUser;
  const allSources = codePlaceholders;
  expect(allSources.length).toBeGreaterThan(0);

  await workspace.createNewNotebook();
  await randomFreeUser.aiAssistant.closePannel();

  await notebook.waitForEditorToLoad();
  await notebook.focusOnBody();

  await randomFreeUser.notebook.closeSidebar();

  await notebook.addBlockSlashCommand('open-integration');
  await page.getByTestId('select-integration:Code').click();

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
  await page.getByText('Preview').last().click();

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
  await page.getByTestId('table-column-menu-button:value').click();

  await page.getByRole('menuitem').getByText('Currency').click();
  await page.getByRole('menuitem').getByText('USD').click();

  await page.getByTestId('integration-modal-continue').click();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.liveBlockDelay);
});

test('check sql integrations is working correctly', async ({ testUser }) => {
  test.slow();
  let notebookURL: string;

  await test.step('create integration', async () => {
    await testUser.notebook.addBlock('open-integration');
    notebookURL = testUser.page.url();
    await testUser.page.getByTestId('select-integration:SQL').click();
    await testUser.page.getByText('Select SQL Connection').click();
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
    await expect(
      testUser.page.getByText('Successfully added connection').first(),
      'Adding SQL connection success message didnt show up'
    ).toBeVisible();
  });

  await test.step('write query', async () => {
    await testUser.page.goto(notebookURL);
    await testUser.notebook.waitForEditorToLoad();
    await testUser.notebook.addBlock('open-integration');
    await testUser.page.getByTestId('select-integration:SQL').click();
    await testUser.page.getByText('Select SQL Connection').click();
    await testUser.page.getByText('Planet Scale Intergration').first().click();
    await testUser.page.getByTestId('code-mirror').click();

    await testUser.page.keyboard.type(
      'select text, number from e2e_test_data_table;'
    );

    await testUser.page.getByRole('button', { name: 'Play Run' }).click();
    await testUser.page.getByTestId('integration-modal-continue').click();
  });

  await test.step('check table data', async () => {
    await Promise.all([
      expect(testUser.page.getByText(/^1$/)).toBeVisible(),
      expect(testUser.page.getByText(/^one$/)).toBeVisible(),
      expect(testUser.page.getByText(/^10$/)).toBeVisible(),
      expect(testUser.page.getByText(/^ten$/)).toBeVisible(),
      expect(testUser.page.getByText(/^11$/)).toBeHidden(),
      expect(testUser.page.getByText(/^eleven$/)).toBeHidden(),
      expect(
        testUser.page.getByText('15 rows, previewing rows 1 to 10')
      ).toBeVisible(),
    ]);

    await testUser.page
      .getByTestId(/Go to page/)
      .nth(1)
      .click();

    await Promise.all([
      expect(testUser.page.getByText(/^1$/)).toBeHidden(),
      expect(testUser.page.getByText(/^one$/)).toBeHidden(),
      expect(testUser.page.getByText(/^11$/)).toBeVisible(),
      expect(testUser.page.getByText(/^eleven$/)).toBeVisible(),
      expect(testUser.page.getByText(/^15$/)).toBeVisible(),
      expect(testUser.page.getByText(/^fifteen$/)).toBeVisible(),
      expect(
        testUser.page.getByText('15 rows, previewing rows 11 to 15')
      ).toBeVisible(),
    ]);
  });

  await expect(testUser.page.getByText('MySQL')).toBeVisible();

  await expect(
    testUser.page.getByText('15 rows, previewing rows 11 to 15')
  ).toBeVisible({ timeout: 90_000 });

  await testUser.page.getByRole('button', { name: 'Pivot view' }).click();

  await expect(
    testUser.page.getByTestId('add-data-view-column-button')
  ).toBeVisible();
  await expect(testUser.page.getByText('exprRef')).toBeHidden();
});

test('checks google sheet integrations with link works', async ({
  testUser,
}) => {
  test.slow();

  await test.step('create integration', async () => {
    await testUser.notebook.addBlock('open-integration');
    await testUser.page.getByTestId('select-integration:Google Sheets').click();
    // fill with wrong usl
    await testUser.page
      .getByPlaceholder('Google Sheet URL')
      // eslint-disable-next-line no-script-url
      .fill("javascript:alert('xss')");
    await expect(
      testUser.page.getByRole('button', { name: 'Import' })
    ).toBeDisabled();
    await testUser.page
      .getByPlaceholder('Google Sheet URL')
      .fill(
        'https://docs.google.com/spreadsheets/d/15ZrP05Qqa84XdAOAh-iFwbe04KErLJeCTPu_OCITUT4/edit?gid=0#gid=0'
      );
    await testUser.page.getByRole('button', { name: 'Import' }).click();
    await expect(
      testUser.page.getByText('Integration loaded successfully!').first()
    ).toBeVisible();
    await testUser.page.getByTestId('integration-modal-continue').click();

    await expect(
      testUser.page.getByText('11 rows, previewing rows 1 to 10')
    ).toBeVisible();
    await testUser.page.getByTestId('integration-modal-continue').click();
    await expect(
      testUser.page.getByText('11 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });
});

// going to check why this stopped working
// eslint-disable-next-line playwright/no-skipped-test
test.skip('checks bigquery sql integrations works', async ({ testUser }) => {
  test.slow();
  let notebookURL: string;

  await test.step('create integration', async () => {
    await testUser.notebook.addBlock('open-integration');
    notebookURL = testUser.page.url();
    await testUser.page.getByTestId('select-integration:SQL').click();
    await testUser.page.getByText('Select SQL Connection').click();
    await testUser.page.getByRole('menuitem', { name: /SQL/ }).click();
    await testUser.page
      .getByRole('button', { name: 'Add a New Connection' })
      .click();
    await testUser.page
      .getByRole('tab', { name: 'Advanced Configuration' })
      .click();
    await testUser.page.getByText(/mysql/).click();
    await testUser.page.getByRole('menuitem', { name: /bigquery/ }).click();

    await testUser.page.locator('#upload-json-credentials').click();

    const base64Data = getDefined(
      process.env.GOOGLE_BIGQUERY_CREDENTIALS,
      'missing env var GOOGLE_BIGQUERY_CREDENTIALS'
    );

    const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');

    const tempFilePath = path.join(
      os.tmpdir(),
      'bigquery-credentials-temp-file.json'
    );
    fs.writeFileSync(tempFilePath, jsonString, 'utf8');
    try {
      await testUser.page.locator('#upload-json-credentials').click();

      await testUser.page
        .locator('#upload-json-credentials')
        .setInputFiles(tempFilePath);

      await testUser.page
        .getByPlaceholder('SQL #')
        .fill('BigQuery Integration');
      await testUser.page
        .getByRole('button', { name: 'Test Connection' })
        .click();

      await expect(testUser.page.getByText('Connection Worked')).toBeVisible();
      await testUser.page.getByTestId('add-conn-button').click();
      await expect(
        testUser.page.getByText('Successfully added connection').first(),
        'Adding SQL connection success message didnt show up'
      ).toBeVisible();
    } finally {
      fs.unlinkSync(tempFilePath);
    }
  });

  await test.step('write query', async () => {
    await testUser.page.goto(notebookURL);
    await testUser.notebook.waitForEditorToLoad();
    await testUser.notebook.addBlock('open-integration');
    await testUser.page.getByTestId('select-integration:SQL').click();
    await testUser.page.getByText('Select SQL Connection').click();
    await testUser.page.getByText('BigQuery Integration').first().click();
    await testUser.page.getByTestId('code-mirror').click();

    await testUser.page.keyboard.type(
      `
      -- This query shows a list of the daily top Google Search terms.
SELECT
   refresh_date AS Day,
   term AS Top_Term,
       -- These search terms are in the top 25 in the US each day.
   rank,
FROM \`bigquery-public-data.google_trends.top_terms\`
WHERE
   rank = 1
       -- Choose only the top term each day.
   AND refresh_date BETWEEN '2024-09-19' AND '2024-10-02'
       -- Filter to the last 2 weeks.
GROUP BY Day, Top_Term, rank
ORDER BY Day DESC
   -- Show the days in reverse chronological order.
      `
    );

    await testUser.page.getByRole('button', { name: 'Play Run' }).click();
    await testUser.page.getByRole('tab', { name: 'Preview' }).click();
  });

  await test.step('check table data', async () => {
    await Promise.all([
      expect(
        testUser.page.locator('div').filter({ hasText: /^Pete Rose$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^Kris Kristofferson$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^Alabama football$/ })
      ).toBeVisible(),
      expect(
        testUser.page.locator('div').filter({ hasText: /^Cowboys vs Giants$/ })
      ).toBeVisible(),
    ]);
  });

  await testUser.page.getByTestId('integration-modal-continue').click();

  await expect(testUser.page.getByText('MySQL')).toBeVisible();
});
