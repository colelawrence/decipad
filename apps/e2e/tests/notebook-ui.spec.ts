import notebookSource from '../__fixtures__/009-number-catalogue-test.json';
import { openColTypeMenu } from '../utils/page/Table';
import { snapshot } from '../utils/src';
import { expect, test } from './manager/decipad-tests';
import { STORAGE_STATE } from '../playwright.config';
import { User } from './manager/test-users';

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

  await test.step('check notebook creation date', async () => {
    await notebook.notebookActions.click();
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const year = currentDate.getFullYear();
    const formattedDate = `Created: ${day} ${month} ${year}`;

    // checks menu has the notebook creation date
    await expect(notebook.page.getByText(formattedDate)).toBeVisible();

    // checks the menu closed by pressing esc
    await notebook.page.keyboard.press('Escape');
    await expect(notebook.page.getByText(formattedDate)).toBeHidden();
  });

  await test.step('can download notebook', async () => {
    await notebook.notebookActions.click();
    const download = page.locator('[role="menuitem"]:has-text("Export")');
    const downloadPromise = page.waitForEvent('download');
    await download.hover();
    const json = page.locator('[role="menuitem"]:has-text("JSON")');
    await json.click();
    const notebookFile = await downloadPromise;
    const err = await notebookFile.failure();
    expect(err).toBeNull();
  });
});

test('notebook icon @notebook', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await testUser.importNotebook(notebookSource);
  await testUser.notebook.waitForEditorToLoad();
  await notebook.checkNotebookTitle('Number Catalog Test');
  await notebook.checkDefaultIcon();

  await test.step('changes the color of the notebook icon', async () => {
    await notebook.openNotebookIconPicker();
    await notebook.pickNotebookColor('Sulu');
    await notebook.pickNotebookIcon('Moon');
  });

  await test.step('screenshot notebook icon picker', async () => {
    await notebook.openSidebar();
    await notebook.openNotebookIconPicker();
    await snapshot(page, 'Notebook: Icon selection', {
      midSize: true,
    });
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
  anotherTestUser,
  testUser,
}) => {
  let sharedPageLocation: string;
  await test.step('publish notebook', async () => {
    sharedPageLocation = await testUser.notebook.publishNotebook(
      'Welcome-to-Decipad'
    );
  });

  await test.step('[another user] check sidebar open in a published notebook from another user', async () => {
    // initial notebook
    await anotherTestUser.createAndNavNewNotebook();
    await anotherTestUser.notebook.openSidebar();

    // visit published notebook
    await anotherTestUser.page.goto(sharedPageLocation!);
    await anotherTestUser.notebook.waitForEditorToLoad();
    await anotherTestUser.notebook.checkSidebarIsClosed();
  });
});

test('number catalog snapshot @sidebar', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await testUser.importNotebook(notebookSource);
  await testUser.notebook.waitForEditorToLoad();
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
    expect(await notebook.getTabName(0)).toContain('Tab 1');
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

    expect(await page.getByText(/Block \d+/).count()).toBe(4);
  });

  await test.step('check Tab 2 is empty', async () => {
    await notebook.selectTab('Tab 2');
    await notebook.focusOnBody();
    await expect(notebook.notebookParagraph).toHaveText('');
    expect(await page.getByText(/Block \d+/).count()).toBe(0);
    await notebook.selectTab('Tab 1');
    expect(await page.getByText(/Block \d+/).count()).toBe(4);
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
    await notebook.moveTab('Tab 4', 'To the left');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 4',
      'Tab 3',
    ]);
    await notebook.moveTab('Tab 4', 'To the right');
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

test('check live collaboration same notebook', async ({
  testUser: userA,
  anotherTestUser: userB,
  browser,
}) => {
  test.slow();
  const { page: userAPage, notebook: userANotebook } = userA;
  const { page: userBPage, notebook: userBNotebook } = userB;
  const currentDate = new Date().getTime();
  const notebookTitle =
    currentDate.toString() + Math.round(Math.random() * 10000);
  let notebookURL = '';
  let notebookJsonUserA = '';
  let notebookJsonUserB = '';
  let notebookJsonUserARevisited = '';

  await test.step('create team workspace', async () => {
    await userA.goToWorkspace();
    await userA.workspace.newWorkspaceWithPlan('plus');
  });

  await test.step('create notebook and invite [userB] to collaborate', async () => {
    await userA.createNewNotebook();
    await userANotebook.updateNotebookTitle(notebookTitle);
    notebookURL = userAPage.url();
    await userANotebook.inviteUser(userB.email, 'editor');
  });

  await test.step('[userB] create new workspace to duplicate shared notebook', async () => {
    await userBPage.goto(notebookURL);
    await userBNotebook.checkNotebookTitle(notebookTitle);
    await userBNotebook.waitForEditorToLoad();
    await userB.aiAssistant.closePannel();
    notebookJsonUserB = await userBNotebook.download();
  });

  await test.step('check both notebooks match at the start', async () => {
    notebookJsonUserA = await userANotebook.download();
    notebookJsonUserB = await userBNotebook.download();
    expect(JSON.parse(notebookJsonUserA)).toMatchObject(
      JSON.parse(notebookJsonUserB)
    );
  });

  // Start modeling

  await test.step('create 4 new tabs tabs called Tab #', async () => {
    await userANotebook.waitForEditorToLoad();
    await userANotebook.checkNotebookTitle(notebookTitle);
    await userBNotebook.waitForEditorToLoad();
    await userBNotebook.checkNotebookTitle(notebookTitle);
    await userANotebook.createTabs(['Tab 2', 'Tab 3', 'Tab 4', 'Tab 5']);

    // 5 total tabs = initial tab + 4 created
    expect(await userANotebook.getTabNames()).toEqual([
      'New Tab',
      'Tab 2',
      'Tab 3',
      'Tab 4',
      'Tab 5',
    ]);
  });

  await test.step('change Tab 5 icon', async () => {
    await userANotebook.hideTab('Tab 5');
    await userANotebook.showTab('Tab 5');
    await userANotebook.changeTabIcon('Tab 5', 'Announcement');
    await userANotebook.changeTabIcon('Tab 5', 'Receipt', {
      usingMenu: true,
    });
  });

  await test.step('rename first tab to Tab 1', async () => {
    await userANotebook.selectTab('New Tab');
    await userANotebook.renameTab('New Tab', 'Tab 1');
    expect(await userANotebook.getTabName(0)).toContain('Tab 1');
    expect(await userANotebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
      'Tab 5',
    ]);
  });

  await test.step('add text paragraphs to Tab 1', async () => {
    await userANotebook.focusOnBody();

    // paragraph
    await userAPage.keyboard.type(`Block 1`);
    await userAPage.keyboard.press('Enter');

    // quote
    await userAPage.keyboard.type(`>`);
    await userAPage.keyboard.press('Space');
    await userAPage.keyboard.type('Block 2');
    await userAPage.keyboard.press('Enter');

    // title
    await userAPage.keyboard.type('#');
    await userAPage.keyboard.press('Space');
    await userAPage.keyboard.type('Block 3');
    await userAPage.keyboard.press('Enter');

    // paragraph
    await userAPage.keyboard.type(`Block 4`);
    await userAPage.keyboard.press('Enter');

    expect(await userAPage.getByText(/Block \d+/).count()).toBe(4);
  });

  await test.step('check Tab 2 is empty', async () => {
    await userANotebook.selectTab('Tab 2');
    await userANotebook.focusOnBody();
    await expect(userANotebook.notebookParagraph).toHaveText('');
    expect(await userAPage.getByText(/Block \d+/).count()).toBe(0);
    await userANotebook.selectTab('Tab 1');
    expect(await userAPage.getByText(/Block \d+/).count()).toBe(4);
  });

  await test.step('move single paragraph from Tab 1 to Tab 2', async () => {
    await userANotebook.selectTab('Tab 1');
    await userANotebook.moveToTab(0, 'Tab 2');
    await userANotebook.selectTab('Tab 2');
    const block1 = await userANotebook.notebookParagraph.nth(0).innerText();
    expect(block1).toContain('Block 1');
  });

  await test.step('move multiple blocks from Tab 1 to Tab 3', async () => {
    await userANotebook.selectTab('Tab 1');
    await userANotebook.selectBlocks(0, 2);
    await userANotebook.moveToTab(0, 'Tab 3');
    await userANotebook.selectTab('Tab 3');

    expect(await userAPage.getByRole('blockquote').innerText()).toContain(
      'Block 2'
    );
    expect(await userAPage.getByRole('heading').innerText()).toContain(
      'Block 3'
    );
    expect(
      await userAPage.getByTestId('paragraph-wrapper').first().innerText()
    ).toContain('Block 4');
  });

  await test.step('create advanced calculations in Tab 4 to move to Tab 5', async () => {
    await userANotebook.selectTab('Tab 4');
    await userANotebook.addAdvancedFormula('num1 = 10');
    await userAPage.keyboard.press('Shift+Enter');
    await userAPage.keyboard.type('num2 = 20', { delay: 100 });
    await userAPage.keyboard.press('Shift+Enter');
    await userAPage.keyboard.type('num1 + num2', { delay: 100 });
    await userANotebook.moveToTab(2, 'Tab 5');

    await expect(
      userAPage.getByTestId('code-line').first().getByTestId('number-result:10')
    ).toBeVisible();
    await expect(
      userAPage.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    await userANotebook.selectTab('Tab 5');

    await expect(
      userAPage.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeVisible();
  });

  await test.step('delete tab 5', async () => {
    // check something from Tab 4 isn't visible
    await expect(
      userAPage.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeHidden();

    await userANotebook.selectTab('Tab 5');
    await userANotebook.deleteTab('Tab 5');

    // check something from Tab 4 is visible since Tab 5 has been deleted and Tab 4 has been selected in its place
    await expect(
      userAPage.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    // check something from Tab 5 doesn't exist anymore
    await expect(
      userAPage.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeHidden();

    expect(await userANotebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
  });

  await test.step('move tab 4', async () => {
    await userANotebook.moveTab('Tab 4', 'To the left');
    expect(await userANotebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 4',
      'Tab 3',
    ]);
    await userANotebook.moveTab('Tab 4', 'To the right');
    expect(await userANotebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
    await userANotebook.moveTab('Tab 4', 'To the start');
    expect(await userANotebook.getTabNames()).toEqual([
      'Tab 4',
      'Tab 1',
      'Tab 2',
      'Tab 3',
    ]);
    await userANotebook.moveTab('Tab 4', 'To the end');
    expect(await userANotebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
    await expect(async () => {
      expect(await userBNotebook.getTabNames()).toEqual([
        'Tab 1',
        'Tab 2',
        'Tab 3',
        'Tab 4',
      ]);
    }).toPass();
  });
  // End modeling

  await test.step('check both notebooks match at the start', async () => {
    notebookJsonUserA = await userANotebook.download();
    notebookJsonUserB = await userBNotebook.download();
    expect(JSON.parse(notebookJsonUserA)).toMatchObject(
      JSON.parse(notebookJsonUserB)
    );
  });

  await test.step('check icognito browser with userA + same notebook keeps same json', async () => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE,
    });
    const userPage = new User(context, await context.newPage());
    await userPage.page.goto(notebookURL);
    await userPage.notebook.checkNotebookTitle(notebookTitle);
    notebookJsonUserARevisited = await userPage.notebook.download();
    expect(JSON.parse(notebookJsonUserARevisited)).toMatchObject(
      JSON.parse(notebookJsonUserA)
    );
  });
});

test('basic notebook comments @comments', async ({
  testUser,
  anotherTestUser,
}) => {
  await test.step('create basic notebook with a collaborator', async () => {
    await testUser.goToWorkspace();
    await testUser.workspace.newWorkspace('@n1n.co team');
    await testUser.createNewNotebook();
    await testUser.notebook.waitForEditorToLoad();
    await testUser.notebook.focusOnBody();
    await testUser.notebook.addParagraph('This is a pragraph');
    await testUser.notebook.inviteUser(anotherTestUser.email, 'editor');
  });

  await test.step('make sure collaborator can comment', async () => {
    const notebookURL = testUser.page.url();

    await anotherTestUser.page.goto(notebookURL);
    await anotherTestUser.notebook.waitForEditorToLoad();
    await anotherTestUser.notebook.openCommentsSidebar();
    await expect(
      anotherTestUser.page.getByText('Be the first one to chat'),
      "notebook without comments placeholder didn't load"
    ).toBeVisible();
    await anotherTestUser.notebook.closeCommentsSidebar();
    await expect(
      anotherTestUser.page.getByText('Be the first one to chat'),
      "Comment sidebar didn't close"
    ).toBeHidden();
    await anotherTestUser.page.getByText('This is a pragraph').hover();

    await anotherTestUser.notebook.addCommentToBlock(0, 'this is a comment');
    await anotherTestUser.notebook.addCommentToOpenThread(
      'this is a second comment'
    );
  });

  await test.step('make sure author can comment', async () => {
    await testUser.notebook.openCommentsSidebar();
    await testUser.page.getByText(/2 comment/).click();
    await expect(
      testUser.page.getByText('this is a comment'),
      "author can't see collaborator comment"
    ).toBeVisible();

    await testUser.notebook.addCommentToOpenThread('this is a third comment');

    // right now collaborators need to refresh the notebook to get new comments
    await anotherTestUser.page.reload();
    await anotherTestUser.notebook.waitForEditorToLoad();
    await anotherTestUser.page.getByText(/3 comment/).click();
    await expect(
      anotherTestUser.page.getByText('this is a third comment'),
      "collaborator can't read authors reply comment"
    ).toBeVisible();
  });

  await test.step('create a second comment block', async () => {
    await testUser.page.reload();
    await testUser.notebook.focusOnBody();
    await testUser.notebook.addParagraph('This is a second pragraph');
    await testUser.notebook.closeCommentsSidebar();
    await testUser.notebook.addCommentToBlock(
      1,
      'this is a comment on a second block'
    );
    await testUser.notebook.addCommentToOpenThread(
      'this is a second comment on a second block'
    );

    await expect(
      testUser.page.getByText('this is a comment on a second block'),
      "author can't comment on a second block"
    ).toBeVisible();

    await expect(
      testUser.page.getByText('this is a second comment on a second block'),
      "author can't comment the second block thread"
    ).toBeVisible();
  });

  await snapshot(testUser.page, 'Notebook: Comments');
});
