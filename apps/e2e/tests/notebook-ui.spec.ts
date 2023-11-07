import { expect, test } from './manager/decipad-tests';
import { snapshot } from '../utils/src';
import notebookSource from '../__fixtures__/009-number-catalogue-test.json';
import { openColTypeMenu } from '../utils/page/Table';

test('notebook actions topbar @notebook', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await test.step('change notebook status', async () => {
    await expect(notebook.notebookStatus).toHaveText('Draft');
    await notebook.changeStatus('Review');
    await expect(notebook.notebookStatus).toHaveText('review');
    await notebook.changeStatus('Done');
    await expect(notebook.notebookStatus).toHaveText('done');
  });

  await test.step('can archive and unarchive notebook', async () => {
    await notebook.archive();
    await notebook.unarchive();
  });

  await test.step('can download notebook', async () => {
    await notebook.notebookActions.click();
    const download = page.locator('[role="menuitem"]:has-text("Download")');

    const downloadPromise = page.waitForEvent('download');
    await download.click();
    const notebookFile = await downloadPromise;
    const err = await notebookFile.failure();
    expect(err).toBeNull();
  });
});

test('notebook icon @notebook', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('renders the initial color and icon', async () => {
    await expect(notebook.notebookIconButton.locator('title')).toHaveText(
      'Decipad Logo'
    );
    const initialColor = await notebook.notebookIconButton.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    expect(initialColor).toBe('rgb(245, 247, 250)'); // grey100
  });

  await test.step('changes notebook icon', async () => {
    await page.locator('button[aria-haspopup="dialog"]').click();
    await page.getByTestId('icon-picker-Moon').click();

    await expect(
      page.locator('button[aria-haspopup="dialog"] title')
    ).toHaveText('Moon');
  });

  await test.step('changes the color of the notebook icon', async () => {
    await page.locator('button[aria-haspopup="dialog"]').click();
    await page.getByTestId('icon-color-picker-Sulu').click();
    await expect(page.getByText('Pick a style')).toBeVisible();
    await snapshot(page, 'Notebook: Icon selection');
  });
});

test('notebook help button @support', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('checks releses', async () => {
    await notebook.notebookHelpButton.click();
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      await page.getByTestId('releases-link').click(),
    ]);
    expect(newPage.url()).toMatch(/.*\/docs\/releases/);
  });

  await test.step('checks docs', async () => {
    await notebook.notebookHelpButton.click();
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      await page.getByTestId('docs-link').click(),
    ]);
    expect(newPage.url()).toMatch(/.*\/docs/);
  });

  await test.step('join discord link works', async () => {
    await notebook.notebookHelpButton.click();
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      await page.getByTestId('discord-link').click(),
    ]);
    expect(newPage.url()).toMatch('https://discord.com/invite/decipad');
  });
});

test('sidebar in publish views @sidebar', async ({
  randomFreeUser,
  testUser,
}) => {
  let sharedPageLocation: string;
  await test.step('publish notebook', async () => {
    sharedPageLocation = await testUser.notebook.publishNotebook();
  });

  await test.step('[another user] check sidebar open in a published notebook from another user', async () => {
    // initial notebook
    await randomFreeUser.createAndNavNewNotebook();
    await randomFreeUser.notebook.openSidebar();

    // visit published notebook
    await randomFreeUser.page.goto(sharedPageLocation!);
    await randomFreeUser.notebook.waitForEditorToLoad();
    await randomFreeUser.notebook.checkSidebarIsClosed();
  });
});

test('number catalog snapshot @sidebar', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await testUser.importNotebook(notebookSource);
  await notebook.checkNotebookTitle('Number Catalog Test');
  await notebook.openNumberCatalog();

  // Opening table column menu to save on percy snapshots
  await openColTypeMenu(page, 1, 'TableVariableName');

  await snapshot(page, 'Notebook: Number Catalog');
});

test('basic tabs funcionality @tabs', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('create 4 new tabs tabs called Tab #', async () => {
    await notebook.createTabs(['Tab 2', 'Tab 3', 'Tab 4', 'Tab 5']);

    // 5 total tabs = initial tab + 4 created
    expect(await notebook.getTabNames()).toEqual([
      'New Tab',
      'Tab 2',
      'Tab 3',
      'Tab 4',
      'Tab 5',
    ]);
  });

  await test.step('change Tab 5 icon', async () => {
    await notebook.hideTab('Tab 5');
    await notebook.showTab('Tab 5');
    await notebook.changeTabIcon('Tab 5', 'Announcement');
    await notebook.changeTabIcon('Tab 5', 'Receipt', { usingMenu: true });
  });

  await test.step('rename first tab to Tab 1', async () => {
    await notebook.selectTab('New Tab');
    await notebook.renameTab('New Tab', 'Tab 1');
    await expect(await notebook.getTabName(0)).toContain('Tab 1');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
      'Tab 5',
    ]);
  });

  await test.step('add text paragraphs to Tab 1', async () => {
    await notebook.focusOnBody();

    // paragraph
    await page.keyboard.type(`Block 1`);
    await page.keyboard.press('Enter');

    // quote
    await page.keyboard.type(`>`);
    await page.keyboard.press('Space');
    await page.keyboard.type('Block 2');
    await page.keyboard.press('Enter');

    // title
    await page.keyboard.type('#');
    await page.keyboard.press('Space');
    await page.keyboard.type('Block 3');
    await page.keyboard.press('Enter');

    // paragraph
    await page.keyboard.type(`Block 4`);
    await page.keyboard.press('Enter');

    await expect(await page.getByText(/Block \d+/).count()).toBe(4);
  });

  await test.step('check Tab 2 is empty', async () => {
    await notebook.selectTab('Tab 2');
    await notebook.focusOnBody();
    await expect(notebook.notebookParagraph).toHaveText('');
    await expect(await page.getByText(/Block \d+/).count()).toBe(0);
    await notebook.selectTab('Tab 1');
    await expect(await page.getByText(/Block \d+/).count()).toBe(4);
  });

  await test.step('move single paragraph from Tab 1 to Tab 2', async () => {
    await notebook.selectTab('Tab 1');
    await notebook.moveToTab(0, 'Tab 2');
    await notebook.selectTab('Tab 2');
    const block1 = await notebook.notebookParagraph.nth(0).innerText();
    expect(block1).toContain('Block 1');
  });

  await test.step('move multiple blocks from Tab 1 to Tab 3', async () => {
    await notebook.selectTab('Tab 1');
    await notebook.selectBlocks(0, 2);
    await notebook.moveToTab(0, 'Tab 3');
    await notebook.selectTab('Tab 3');

    expect(await page.getByRole('blockquote').innerText()).toContain('Block 2');
    expect(await page.getByRole('heading').innerText()).toContain('Block 3');
    expect(
      await page.getByTestId('paragraph-wrapper').first().innerText()
    ).toContain('Block 4');
  });

  await test.step('create advanced calculations in Tab 4 to move to Tab 5', async () => {
    await notebook.selectTab('Tab 4');
    await notebook.addAdvancedFormula('num1 = 10');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num2 = 20');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num1 + num2');
    await notebook.moveToTab(2, 'Tab 5');

    await expect(
      page.getByTestId('code-line').first().getByTestId('number-result:10')
    ).toBeVisible();
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    await notebook.selectTab('Tab 5');

    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeVisible();
  });

  await test.step('delete tab 5', async () => {
    // check something from Tab 4 isn't visible
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeHidden();

    await notebook.selectTab('Tab 5');
    await notebook.deleteTab('Tab 5');

    // check something from Tab 4 is visible since Tab 5 has been deleted and Tab 4 has been selected in its place
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    // check something from Tab 5 doesn't exist anymore
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeHidden();

    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
  });

  await test.step('move tab 4', async () => {
    await notebook.moveTab('Tab 4', 'Left');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 4',
      'Tab 3',
    ]);
    await notebook.moveTab('Tab 4', 'Right');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
    await notebook.moveTab('Tab 4', 'To the start');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 4',
      'Tab 1',
      'Tab 2',
      'Tab 3',
    ]);
    await notebook.moveTab('Tab 4', 'To the end');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
  });
});
