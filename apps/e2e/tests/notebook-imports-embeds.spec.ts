import type { Page } from './manager/decipad-tests';
import { expect, test } from './manager/decipad-tests';
import { snapshot } from '../utils/src';
import notebookSource from '../__fixtures__/013-new-welcome.json';
import { doubleClickCell } from '../utils/page/Table';

test('import image via upload @imports @images', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await test.step('Importing image through file explorer', async () => {
    await notebook.focusOnBody();
    await notebook.addParagraph('Insert Below this');
    await page.keyboard.press('Enter');
    await notebook.addParagraph('Insert Above this');
    await page.keyboard.press('ArrowUp');

    await notebook.addImage({
      method: 'upload',
      file: './__fixtures__/images/download.png',
    });
    await expect(
      page
        .getByTestId('draggable-block')
        .nth(1)
        .getByTestId('notebook-image-block')
        .getByRole('img'),
      "Image wasn't added on the second block position between insert below and insert above"
    ).toBeVisible();
    await snapshot(
      page as Page,
      'Notebook: Decipad logo image at biggest size'
    );
  });

  await test.step('Rezise image to smallest size', async () => {
    await page
      .getByTestId('notebook-image-block')
      .locator('div')
      .nth(3)
      .hover();
    await page.mouse.down();
    await page
      .getByTestId('notebook-image-block')
      .locator('div')
      .nth(2)
      .hover();
    await page.mouse.up();
    await snapshot(
      page as Page,
      'Notebook: Decipad logo image at smallest size'
    );
  });

  await test.step('set image caption', async () => {
    await page.getByTestId('notebook-image-block').getByRole('img').click();
    await page.getByTestId('notebook-image-caption').fill('Test Caption');
    await notebook.focusOnBody();
    await expect(page.getByTestId('notebook-image-caption')).toHaveText(
      'Test Caption'
    );
  });

  await test.step('delete image imported via file', async () => {
    await notebook.deleteBlock(0);
    await notebook.deleteBlock(0);
    await notebook.deleteBlock(0);
    await expect(
      page.getByTestId('notebook-image-block').locator('img')
    ).toBeHidden();
  });
});

test('import image via link @imports @images', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await notebook.addImage({
    method: 'link',
    link: 'https://app.decipad.com/docs/assets/images/image_collab-1be976675d57684cb0a1223a5d6551ff.png',
  });
  await expect(
    page.getByTestId('notebook-image-block').locator('img')
  ).toBeVisible();
});

test('import CSVs via link @imports @csv', async ({ testUser }) => {
  test.slow();
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await notebook.closeSidebar();

  await test.step('importing csv file through csv panel with file', async () => {
    await notebook.addCSV({
      method: 'upload',
      file: '__fixtures__/csv/accounts.csv',
      varName: 'Variable',
    });
    await expect(async () => {
      await expect(
        page.getByTestId('live-code').getByTestId('loading-animation').first()
      ).toBeHidden();
    }, 'CSV from file upload took too much time to load').toPass({
      timeout: 1000,
    });

    await expect(
      page.getByText('7109 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });

  await test.step('delete csvs', async () => {
    await expect(async () => {
      await page.locator(`[data-testid="drag-handle"] >> nth=1`).click();
      await page.getByRole('menuitem', { name: /Delete/ }).click();
      await expect(page.getByTestId('integration-block')).toBeHidden();
    }, "Wasn't able to delete all CSV tables").toPass();
    await page.reload();
    await notebook.waitForEditorToLoad();
    await expect(
      page.getByTestId('integration-block'),
      'CSV Tables still present after being deleted and realoading notebook'
    ).toBeHidden();
  });
});

test('embed loom on deipad @embeds', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await notebook.addEmbed(
    'https://www.loom.com/embed/fdd9cc32f4b2494ca4e4e4420795d2e0?sid=e1964b86-c0a2-424c-8b12-df108627ecd2'
  );
  await expect(
    page
      .frameLocator('iframe[title="decipad-embed"]')
      .getByRole('link', {
        name: 'Loom video for E2E',
      })
      .first()
  ).toBeVisible();
});

test('embed google slided deipad @embeds', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await notebook.addEmbed(
    'https://docs.google.com/presentation/d/e/2PACX-1vR4fKEEmGwjs7JUioJup8U4ERoV7xkVc2NEJdhNlAfIQRo-uShVPz2EERzEef8K5vAoqr4TBgTO8dMC/embed?start=false&loop=false&delayms=3000',
    { typeManually: true }
  );
  await expect(
    page
      .frameLocator('iframe[title="decipad-embed"]')
      .getByRole('link', { name: 'Google Slides' })
  ).toBeVisible();
});

test('embed pitch on deipad @embeds', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await notebook.addEmbed(
    'https://pitch.com/embed/d32f33f3-1ac8-4d44-aee6-672899febcf9'
  );
  await expect(async () => {
    await expect(
      page
        .frameLocator('iframe[title="decipad-embed"]')
        .locator('[data-test-id="read-only-text"]')
        .getByText('Pitch Slides Decipad')
    ).toBeVisible();
  }, `Pitch Embed didn't load properly`).toPass();
});

test('check calculations from CSVs imported with link work across tabs @imports @csv @tabs', async ({
  testUser,
  unregisteredUser,
}) => {
  test.slow();
  const { page, notebook } = testUser;
  const { page: unregisteredUserPage, notebook: unregisteredUserNotebook } =
    unregisteredUser;
  let notebookLink = '';

  await notebook.focusOnBody();
  await notebook.closeSidebar();

  await test.step('importing csv link through csv panel with link', async () => {
    await notebook.addCSV({
      method: 'link',
      link: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlmKKmOm0b22FcmTTiLy44qz8TPtSipfvnd1hBpucDISH4p02r3QuCKn3LIOe2UFxotVpYdbG8KBSf/pub?gid=0&single=true&output=csv',
      firstRowHeader: false,
      varName: 'Variable',
    });

    await expect(
      page.getByText('20 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });

  await test.step('add formula that uses the integration table', async () => {
    await notebook.addFormula(
      'CalculationIntegrationTable',
      'count(Variable.A)'
    );
    await expect(page.getByTestId('number-result:20')).toBeVisible();
  });

  await test.step('seperate calculation and source table into different tabs', async () => {
    await notebook.createTab('Another Tab');
    await notebook.selectTab('New Tab');
    await notebook.moveToTab(1, 'Another Tab');
    await notebook.selectTab('nother Tab');

    await expect(
      page.getByText('20 rows, previewing rows 1 to 10')
    ).toBeVisible();

    await notebook.selectTab('New Tab');

    await expect(
      page.getByTestId('integration-block').filter({ hasText: /Variable/ })
    ).toBeHidden();
  });

  await test.step('reload notebook and switch fast between tabs to see if calculation gets stuck', async () => {
    await page.reload();
    await testUser.notebook.closeSidebar();
    await notebook.selectTab('New Tab');
    await notebook.selectTab('Another Tab');
    await notebook.selectTab('New Tab');
    await expect(
      page.getByTestId('number-result:20'),
      'Formula that uses integration from another tab has a calculation error or never loads'
    ).toBeVisible();
    notebookLink = testUser.page.url();
    await testUser.notebook.publishNotebook();
  });

  await test.step('[unregisteredUser] can navigate to notebook with csv calculations', async () => {
    await unregisteredUserPage.goto(notebookLink);
    await unregisteredUserNotebook.waitForEditorToLoad();
    await unregisteredUserPage.getByText('Try Decipad').waitFor();
    await unregisteredUserNotebook.selectTab('New Tab');
    await expect(
      unregisteredUserPage.getByTestId('number-result:20'),
      'Formula that uses integration from another tab has a calculation error or never loads'
    ).toBeVisible();
    await unregisteredUserNotebook.selectTab('Another Tab');
    await expect(
      unregisteredUserPage.getByText('20 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });
});

test('csv integrations work when duplicating a notebook', async ({
  testUser,
  anotherRandomFreeUser,
}) => {
  test.slow();
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await notebook.closeSidebar();

  await test.step('importing csv link through csv panel with link', async () => {
    await notebook.addCSV({
      method: 'upload',
      file: './__fixtures__/csv/accounts.csv',
      varName: 'Variable',
    });
    await expect(async () => {
      await expect(
        page.getByTestId('live-code').getByTestId('loading-animation').first()
      ).toBeHidden();
    }, 'CSV from file upload took too much time to load').toPass({
      timeout: 1000,
    });

    await expect(
      page.getByText('7109 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });

  // Wait for CSV to be placed in the document.
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await notebook.page.waitForTimeout(5_000);

  await test.step('publish notebook', async () => {
    await notebook.focusOnBody();
    await notebook.publishNotebook();
  });

  await test.step('Unregistered user can see integration', async () => {
    await anotherRandomFreeUser.page.goto(page.url());

    await expect(
      page.getByText('7109 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });

  await test.step('Unregistered user can duplicate notebook with integrations', async () => {
    await anotherRandomFreeUser.notebook.topRightDuplicateNotebook.click();
    await expect(anotherRandomFreeUser.notebook.notebookActions).toBeVisible();

    await expect(
      page.getByText('7109 rows, previewing rows 1 to 10')
    ).toBeVisible();
  });
});

test('csv calculations propagate @csv', async ({
  testUser,
  randomFreeUser,
}) => {
  test.slow();
  const { notebook } = testUser;
  await testUser.importNotebook(notebookSource);
  await testUser.notebook.waitForEditorToLoad();

  await notebook.addCSV({
    method: 'upload',
    file: '__fixtures__/csv/funnel.csv',
    varName: 'Funnel',
  });

  // to be removed once smart refs autoresolve works on column refs
  await notebook.addFormula(
    'ClosedLookup',
    `lookup(Funnel, Funnel.Stage == "Closed").London`
  );

  // to be removed when autosesolve smart refs work on charts
  await testUser.page.getByTestId('chart-settings-button').first().click();
  await testUser.page.getByText('Source Table').click();
  await testUser.page
    .getByRole('menuitem', { name: 'Funnel', exact: true })
    .click();

  await testUser.page.getByTestId('chart-settings-button').nth(1).click();
  await testUser.page.getByText('Source Table').click();
  await testUser.page
    .getByRole('menuitem', { name: 'Funnel', exact: true })
    .click();

  await testUser.page.getByTestId('chart-settings-button').nth(2).click();
  await testUser.page.getByText('Source Table').click();
  await testUser.page
    .getByRole('menuitem', { name: 'Funnel', exact: true })
    .click();

  // to be removed when autoresolve smart refs work for cell tables
  await doubleClickCell(testUser.page, 1, 1, 'ClosedQ3');
  await testUser.page.keyboard.press('ControlOrMeta+A');
  await testUser.page.keyboard.press('Backspace');
  await testUser.page.keyboard.insertText('Clo');
  await expect(testUser.page.getByText('We currently only')).toBeVisible();
  await testUser.page.keyboard.press('Enter');
  await testUser.page.reload();
  await testUser.notebook.waitForEditorToLoad();

  const sharedPageLocation = await testUser.notebook.publishNotebook();

  await randomFreeUser.page.goto(sharedPageLocation!);
  await randomFreeUser.notebook.waitForEditorToLoad();
  // await randomFreeUser.notebook.checkCalculationErrors();
  await snapshot(randomFreeUser.page, 'Notebook: Welcome to decipad 2.0');
});
