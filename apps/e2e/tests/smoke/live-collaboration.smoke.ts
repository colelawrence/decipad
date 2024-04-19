/* eslint-disable playwright/no-standalone-expect */
import { expect, test as smoketest } from '../manager/decipad-tests';
import { STORAGE_STATE } from '../../playwright.config';
import { User } from '../manager/test-users';

smoketest(
  'check live collaboration same notebook',
  async ({ testUser: userA, anotherTestUser: userB, browser }) => {
    smoketest.slow();
    const { page: userAPage, notebook: userANotebook } = userA;
    const { page: userBPage, notebook: userBNotebook } = userB;
    const currentDate = new Date().getTime();
    const notebookTitle =
      currentDate.toString() + Math.round(Math.random() * 10000);
    let notebookURL = '';
    let notebookJsonUserA = '';
    let notebookJsonUserB = '';
    let notebookJsonUserARevisited = '';

    await smoketest.step('create team workspace', async () => {
      await userA.goToWorkspace();
      await userA.workspace.newWorkspaceWithPlan('team');
    });

    await smoketest.step(
      'create notebook and invite [userB] to collaborate',
      async () => {
        await userA.createNewNotebook();
        await userANotebook.updateNotebookTitle(notebookTitle);
        notebookURL = userAPage.url();
        await userANotebook.inviteUser(userB.email, 'editor');
      }
    );

    await smoketest.step(
      '[userB] create new workspace to duplicate shared notebook',
      async () => {
        await userBPage.goto(notebookURL);
        await userBNotebook.checkNotebookTitle(notebookTitle);
        await userBNotebook.waitForEditorToLoad();
        await userB.aiAssistant.closePannel();
        notebookJsonUserB = await userBNotebook.download();
      }
    );

    await smoketest.step(
      'check both notebooks match at the start',
      async () => {
        notebookJsonUserA = await userANotebook.download();
        notebookJsonUserB = await userBNotebook.download();
        expect(JSON.parse(notebookJsonUserA)).toMatchObject(
          JSON.parse(notebookJsonUserB)
        );
      }
    );

    // Start modeling

    await smoketest.step('create 4 new tabs tabs called Tab #', async () => {
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

    await smoketest.step('change Tab 5 icon', async () => {
      await userANotebook.hideTab('Tab 5');
      await userANotebook.showTab('Tab 5');
      await userANotebook.changeTabIcon('Tab 5', 'Announcement');
      await userANotebook.changeTabIcon('Tab 5', 'Receipt', {
        usingMenu: true,
      });
    });

    await smoketest.step('rename first tab to Tab 1', async () => {
      await userANotebook.selectTab('New Tab');
      await userANotebook.renameTab('New Tab', 'Tab 1');
      await expect(await userANotebook.getTabName(0)).toContain('Tab 1');
      expect(await userANotebook.getTabNames()).toEqual([
        'Tab 1',
        'Tab 2',
        'Tab 3',
        'Tab 4',
        'Tab 5',
      ]);
    });

    await smoketest.step('add text paragraphs to Tab 1', async () => {
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

      await expect(await userAPage.getByText(/Block \d+/).count()).toBe(4);
    });

    await smoketest.step('check Tab 2 is empty', async () => {
      await userANotebook.selectTab('Tab 2');
      await userANotebook.focusOnBody();
      await expect(userANotebook.notebookParagraph).toHaveText('');
      await expect(await userAPage.getByText(/Block \d+/).count()).toBe(0);
      await userANotebook.selectTab('Tab 1');
      await expect(await userAPage.getByText(/Block \d+/).count()).toBe(4);
    });

    await smoketest.step(
      'move single paragraph from Tab 1 to Tab 2',
      async () => {
        await userANotebook.selectTab('Tab 1');
        await userANotebook.moveToTab(0, 'Tab 2');
        await userANotebook.selectTab('Tab 2');
        const block1 = await userANotebook.notebookParagraph.nth(0).innerText();
        expect(block1).toContain('Block 1');
      }
    );

    await smoketest.step(
      'move multiple blocks from Tab 1 to Tab 3',
      async () => {
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
      }
    );

    await smoketest.step(
      'create advanced calculations in Tab 4 to move to Tab 5',
      async () => {
        await userANotebook.selectTab('Tab 4');
        await userANotebook.addAdvancedFormula('num1 = 10');
        await userAPage.keyboard.press('Shift+Enter');
        await userAPage.keyboard.type('num2 = 20', { delay: 100 });
        await userAPage.keyboard.press('Shift+Enter');
        await userAPage.keyboard.type('num1 + num2', { delay: 100 });
        await userANotebook.moveToTab(2, 'Tab 5');

        await expect(
          userAPage
            .getByTestId('code-line')
            .first()
            .getByTestId('number-result:10')
        ).toBeVisible();
        await expect(
          userAPage
            .getByTestId('code-line')
            .last()
            .getByTestId('number-result:20')
        ).toBeVisible();

        await userANotebook.selectTab('Tab 5');

        await expect(
          userAPage
            .getByTestId('code-line')
            .last()
            .getByTestId('number-result:30')
        ).toBeVisible();
      }
    );

    await smoketest.step('delete tab 5', async () => {
      // check something from Tab 4 isn't visible
      await expect(
        userAPage
          .getByTestId('code-line')
          .last()
          .getByTestId('number-result:20')
      ).toBeHidden();

      await userANotebook.selectTab('Tab 5');
      await userANotebook.deleteTab('Tab 5');

      // check something from Tab 4 is visible since Tab 5 has been deleted and Tab 4 has been selected in its place
      await expect(
        userAPage
          .getByTestId('code-line')
          .last()
          .getByTestId('number-result:20')
      ).toBeVisible();

      // check something from Tab 5 doesn't exist anymore
      await expect(
        userAPage
          .getByTestId('code-line')
          .last()
          .getByTestId('number-result:30')
      ).toBeHidden();

      expect(await userANotebook.getTabNames()).toEqual([
        'Tab 1',
        'Tab 2',
        'Tab 3',
        'Tab 4',
      ]);
    });

    await smoketest.step('move tab 4', async () => {
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

    await smoketest.step(
      'check both notebooks match at the start',
      async () => {
        notebookJsonUserA = await userANotebook.download();
        notebookJsonUserB = await userBNotebook.download();
        expect(JSON.parse(notebookJsonUserA)).toMatchObject(
          JSON.parse(notebookJsonUserB)
        );
      }
    );

    await smoketest.step(
      'check icognito browser with userA + same notebook keeps same json',
      async () => {
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
      }
    );
  }
);
