/* eslint-disable playwright/valid-describe-callback */
/* eslint-disable playwright/no-conditional-expect */
import { expect, test, Page } from './manager/decipad-tests';
import { Timeouts, snapshot } from '../utils/src';

const byName = (a: { name: string }, b: { name: string }): number => {
  return a.name.localeCompare(b.name);
};

test('can create workspace folders @workspace', async ({ randomFreeUser }) => {
  const { page, workspace } = randomFreeUser;
  await test.step('create new workspace folder', async () => {
    await workspace.newFolder('Section Creation Test 1', { colourIndex: 2 });
  });

  await test.step('can cancel creation of a new workspace folder', async () => {
    await workspace.newFolder('Section Creation Test 1', { create: false });
    await workspace.modalCloseButton.click();
    await expect(page.getByText('Section Creation Test 2')).toBeHidden();
  });
});

test('can move noteboks to workspace folders @workspace', async ({
  randomFreeUser,
}) => {
  const { page, workspace } = randomFreeUser;
  const sectionName = 'Drag and Drop Test';

  await test.step('new workspace folder', async () => {
    await workspace.newFolder(sectionName);

    // Navigating back to My Notebooks
    await expect(async () => {
      await page.getByTestId('my-notebooks').click();
      await expect(page.getByText('No documents to list')).toBeHidden();
    }).toPass();
  });

  await test.step('Searching on the search bar and dragging the notebook', async () => {
    await expect(async () => {
      await expect(page.getByTestId('workspace-hero-title')).toBeVisible();
    }).toPass();
    await workspace.searchForNotebook('Welcome to Decipad!');

    await workspace.moveNotebookToFolder('Welcome to Decipad!', sectionName);
    await workspace.checkLabel(sectionName);
  });

  await test.step('Checking if the right notebook was dragged into the section', async () => {
    await workspace.selectSection(sectionName);
    await expect(
      page.getByTestId('notebook-list-item').getByText('Welcome to Decipad!')
    ).toBeVisible();

    // check section labels are visible with filter
    await workspace.checkLabel(sectionName);

    // check section label are persistant on reload
    await page.reload();
    await workspace.checkLabel(sectionName);

    // check standard view showcases notebook labels
    await expect(async () => {
      await page.getByTestId('my-notebooks').click();
      await workspace.checkLabel(sectionName);
    }).toPass();
  });

  await test.step('Checking if the no search result warning banner is displayed', async () => {
    await expect(page.getByTestId('no-correct-search-result')).toBeHidden();
  });
});

test('should display the initial notebooks @workspace', async ({
  randomFreeUser: { page, workspace, notebook },
}) => {
  const workspaceNotebooks = await workspace.getPadList(true);

  // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
  process.env.CI || process.env.DECI_E2E
    ? expect(workspaceNotebooks).toMatchObject(
        [
          'Welcome to Decipad!',
          'Starting a Business - Example Notebook',
          'Weekend Trip - Example Notebook',
        ]
          .map((workspaceNotebook) => ({ name: workspaceNotebook }))
          .sort(byName)
      )
    : expect(workspaceNotebooks).toMatchObject(
        [
          '[Template] Capitalisation table for seed founders',
          '[Template] Decipad Investor Update: Mar 2023',
          '[Template] How much is Apple worth? Breaking down a DCF model.',
          '[Template] Offer Letter',
          '[Template] Performance summary letter',
          '[Template] Sales Report: Monthly Pipeline Update',
          '[Template] Shilling Founders Fund | An innovative approach to profit sharing',
          '[Template] Sprint Capacity Calculation for Scrum Teams',
          '[Template] Understanding stock options at an early stage startup',
          'Everything, everywhere, all at once',
          'Very weird loading when editing',
          'Welcome to Decipad!',
          'Starting a Business - Example Notebook',
          'Weekend Trip - Example Notebook',
        ]
          .map((workspaceNotebook) => ({ name: workspaceNotebook })) // Rename 'notebook' to 'pad'
          .sort(byName)
      );

  // take snapshot after visint a notebook to check with the layout of the workspace if affected
  await page.getByRole('link', { name: /Starting a Business/ }).click();
  await notebook.waitForEditorToLoad();
  await notebook.checkNotebookTitle('🕯Starting a Business - Example Notebook');
  await notebook.returnToWorkspace();
  await snapshot(page as Page, 'Dashboard: Initial Notebooks');
});

test('shows workspace in dark mode mode @workspace', async ({
  randomFreeUser: { page },
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  let localStorageValue: string | null;
  await expect(async () => {
    localStorageValue = await page.evaluate(() => {
      window.localStorage.setItem('deciThemePreference', 'dark');
      return window.localStorage.getItem('deciThemePreference');
    });

    if (localStorageValue !== null) {
      expect(localStorageValue).toMatch('dark');
    }
  }).toPass();
  await page.reload({ waitUntil: 'load' });
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await snapshot(page as Page, 'Dashboard: Initial Notebooks Darkmode');
});

test('shows workspace in light mode mode @workspace', async ({
  randomFreeUser: { page },
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(async () => {
    const localStorageValue = await page.evaluate(() => {
      window.localStorage.setItem('deciThemePreference', 'light');
      return localStorage.getItem('deciThemePreference');
    });

    if (localStorageValue !== null) {
      expect(localStorageValue).toMatch('light');
    }
  }).toPass();
  await page.reload({ waitUntil: 'load' });
});

test('workspace operations @workspace', async ({
  randomFreeUser: { page, workspace },
}) => {
  await test.step('creates a new pad and navigates to pad detail', async () => {
    await Promise.all([
      workspace.clickNewPadButton(),
      page.waitForURL('/n/**'),
    ]);

    // Waits for docsync to send updates through.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.syncDelay);
    await page.goBack();
  });

  await test.step('can remove pad', async () => {
    const padIndex = (await workspace.getPadList()).findIndex(
      (pad) => pad.name !== 'My first pad'
    );
    expect(padIndex).toBeGreaterThanOrEqual(0);
    await workspace.removePad(padIndex);

    await expect(async () => {
      const pads = await workspace.getPadList();
      // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
      process.env.CI || process.env.DECI_E2E
        ? expect(pads).toHaveLength(3)
        : expect(pads).toHaveLength(14);
    }).toPass();
  });

  await test.step('can duplicate pad', async () => {
    await workspace.duplicatePad();

    await expect(async () => {
      let pads = await workspace.getPadList();
      // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
      process.env.CI
        ? expect(pads).toHaveLength(4)
        : expect(pads).toHaveLength(15);

      pads = await workspace.getPadList();
      const copyIndex = pads.findIndex((pad) =>
        pad.name?.startsWith('Copy of')
      );
      expect(copyIndex).toBeGreaterThanOrEqual(0);
    }).toPass();
  });

  await test.step('can navigate to pad detail', async () => {
    const pads = await workspace.getPadList();
    expect(pads.length).toBeGreaterThan(0);
    const pad = pads[0];
    await pad.anchor.click();
    expect(page.url()).toMatch(/\/n\/[^/]+/);
    await page.goBack();
  });
});

test('workspace flows @workspace', async ({
  randomFreeUser: { page, workspace },
}) => {
  await test.step('Archive & delete a notebook', async () => {
    await workspace.archivePad(0);
    await workspace.openArchive();
    await workspace.deleteNotepad(0);
    await expect(page.getByText('No documents to list')).toBeVisible();
  });

  await test.step('Create a workspace', async () => {
    await workspace.newWorkspace('Wtf');
    await expect(page.getByTestId('workspace-hero-title')).toHaveText(
      'Welcome toWtf'
    );
  });

  await test.step('Update name in the account settings modal', async () => {
    await workspace.updateAccountSettings({ name: 'Joe Doe' });
    await expect(page.locator('[title="Joe Doe"]')).toHaveText('Joe Doe');

    await workspace.openAccountSettings();
    await expect(page.getByTestId('user-name')).toHaveValue('Joe Doe');
    await workspace.closeAccountSettings();
  });

  await test.step('Update username in the account settings modal', async () => {
    const currentDate = Date.now();
    await workspace.updateAccountSettings({ username: `joedoe${currentDate}` });
    await workspace.openAccountSettings();
    await expect(page.getByTestId('user-username')).toHaveValue(
      `@joedoe${currentDate}`
    );
  });
});

test('workspace permissions @workspace', async ({
  testUser,
  randomFreeUser,
  anotherRandomFreeUser,
}) => {
  test.slow();
  let premiumWorkspaceId: string;
  await test.step('premium user is premium', async () => {
    await testUser.goToWorkspace();
    premiumWorkspaceId = (
      await testUser.workspace.newWorkspace('Premium Workspace@n1n.co team')
    )
      .split('/')
      .at(-1)!;
    await testUser.page.reload();
  });

  await test.step('invite member and admin', async () => {
    await testUser.workspace.checkWorkspaceMember(testUser.email);
    await testUser.workspace.addWorkspaceMember(randomFreeUser.email);
    await testUser.workspace.addWorkspaceMember(
      anotherRandomFreeUser.email,
      'Admin'
    );
    await testUser.createAndNavNewNotebook(premiumWorkspaceId);
    await testUser.notebook.updateNotebookTitle('Test Notepad');
    await testUser.notebook.checkNotebookTitle('Test Notepad');
    await testUser.goToWorkspace(premiumWorkspaceId);
  });

  await test.step('standard member checks', async () => {
    await randomFreeUser.goToWorkspace(premiumWorkspaceId);
    await expect(
      randomFreeUser.page.getByTestId('manage-workspace-members')
    ).toBeHidden();

    await randomFreeUser.page.getByTestId('list-notebook-title').click();
    await randomFreeUser.notebook.waitForEditorToLoad();
    await expect(randomFreeUser.notebook.notebookTitle).toBeEditable();
    await expect(
      randomFreeUser.page.getByTestId('paragraph-content')
    ).toBeEditable();

    await randomFreeUser.notebook.addParagraph('I am editing');
    await expect(randomFreeUser.page.getByText('I am editing')).toBeVisible();

    await randomFreeUser.notebook.checkNotebookTitle('Test Notepad');
    await randomFreeUser.notebook.updateNotebookTitle('Standard member update');
    await randomFreeUser.notebook.checkNotebookTitle('Standard member update');
  });

  await test.step('standard member checks', async () => {
    await anotherRandomFreeUser.goToWorkspace(premiumWorkspaceId);
    await anotherRandomFreeUser.workspace.openWorkspaceSettingsSection();
    await expect(
      anotherRandomFreeUser.page.getByTestId('manage-workspace-members')
    ).toBeVisible();

    await anotherRandomFreeUser.page.getByTestId('list-notebook-title').click();

    await expect(anotherRandomFreeUser.notebook.notebookTitle).toBeEditable();

    await anotherRandomFreeUser.notebook.checkNotebookTitle(
      'Standard member update'
    );
    await anotherRandomFreeUser.notebook.updateNotebookTitle(
      'admin member update'
    );
    await anotherRandomFreeUser.notebook.checkNotebookTitle(
      'admin member update'
    );

    await anotherRandomFreeUser.page.getByTestId('publish-button').click();
    await expect(
      anotherRandomFreeUser.page.getByText(
        'Invited users will receive an email to the provided email address'
      )
    ).toBeVisible();
  });
});

test('notebook reader and editor permissions', async ({
  testUser,
  randomFreeUser,
  anotherRandomFreeUser,
}) => {
  let notebook: string;

  await test.step('invite reader and editor to notebook', async () => {
    await testUser.goToWorkspace();
    await testUser.workspace.newWorkspaceWithPlan('team');

    await testUser.workspace.newNotebook.click();
    await testUser.notebook.inviteUser(randomFreeUser.email, 'reader');
    await testUser.notebook.inviteUser(anotherRandomFreeUser.email, 'editor');
    notebook = testUser.page.url();
  });

  await test.step('reader checks', async () => {
    await randomFreeUser.page.goto(notebook);
    await randomFreeUser.notebook.waitForEditorToLoad();
    await expect(
      randomFreeUser.page.getByText('You are in reading mode')
    ).toBeVisible();

    expect(
      await randomFreeUser.notebook.notebookTitle.evaluate(
        (e: HTMLElement) => e.isContentEditable
      )
    ).toBeFalsy();

    expect(
      await randomFreeUser.notebook.notebookParagraph.evaluate(
        (e: HTMLElement) => e.isContentEditable
      )
    ).toBeFalsy();
  });

  await test.step('collaborator checks', async () => {
    await anotherRandomFreeUser.page.goto(notebook);
    await anotherRandomFreeUser.notebook.waitForEditorToLoad();

    await expect(
      anotherRandomFreeUser.page.getByText('You are in reading mode')
    ).toBeHidden();

    await anotherRandomFreeUser.page.getByTestId('publish-button').click();
    await expect(
      anotherRandomFreeUser.page.getByText(
        'To invite users to the notebook you must have a team or enterprise plan'
      )
    ).toBeVisible();
    await anotherRandomFreeUser.notebook.focusOnBody();
    await anotherRandomFreeUser.notebook.addParagraph('I am editing');
    await expect(
      anotherRandomFreeUser.page.getByText('I am editing')
    ).toBeVisible();
    await anotherRandomFreeUser.notebook.updateNotebookTitle(
      'edited by collaborator'
    );
    await anotherRandomFreeUser.notebook.checkNotebookTitle(
      'edited by collaborator'
    );
  });
});

test('workspace reader checks @workspace @roles', async ({
  testUser,
  randomFreeUser,
}) => {
  await testUser.goToWorkspace();
  await testUser.workspace.newWorkspaceWithPlan('team');
  const teamWorkspaceURL = testUser.page.url();

  await testUser.workspace.checkWorkspaceMember(testUser.email);
  await testUser.workspace.addWorkspaceMember(randomFreeUser.email, 'Reader');
  await testUser.workspace.createNewNotebook();
  await testUser.aiAssistant.closePannel();
  await testUser.notebook.waitForEditorToLoad();

  await test.step('standard member checks', async () => {
    await randomFreeUser.page.goto(teamWorkspaceURL);
    await randomFreeUser.workspace.waitWorkspaceLoad();
    await expect(
      randomFreeUser.workspace.settingsSection,
      'workspace readers shoudnt be able to access workspace settings'
    ).toBeHidden();
    await expect(
      randomFreeUser.page.getByTestId('my-archive'),
      'workspace readers shoudnt be able to  access workspace archive'
    ).toBeHidden();
    await randomFreeUser.page.getByTestId('list-notebook-options').click();
    await expect(
      randomFreeUser.page.getByText(
        'As a Reader, you can not download or copy this notebook.'
      ),
      'workspace readers shoudnt be able to notebook options menu'
    ).toBeVisible();
    await randomFreeUser.page.keyboard.press('Escape');
    await randomFreeUser.page.getByTestId('notebook-state').click();
    await expect(
      randomFreeUser.page.getByText(
        'As a Reader, you can not change Notebook status.'
      ),
      'workspace readers shoudnt be able to access notebook options menu'
    ).toBeVisible();
    await randomFreeUser.page.keyboard.press('Escape');

    await randomFreeUser.page.getByText('Welcome to Decipad').click();

    // For some reason, right now, users invited to be readers on a
    // notebook can open the notebook options menu, adding some checks to prevent escalation of privileges
    await randomFreeUser.notebook.notebookActions.click();
    await expect(
      randomFreeUser.page.getByText(
        'As a Reader, you can not download or copy this notebook.'
      ),
      'workspace readers shoudnt be able to access notebook options menu'
    ).toBeVisible();
    await expect(
      randomFreeUser.notebook.changeStatusMenu,
      "user invited to be notebook reader can't acces change notebook status menu"
    ).toBeHidden();
    await expect(
      randomFreeUser.notebook.archiveNotebook,
      "user invited to be notebook reader can't access notebook archive menu"
    ).toBeHidden();
  });
});

test('workspace editor checks @workspace @roles', async ({
  testUser,
  randomFreeUser,
}) => {
  await testUser.goToWorkspace();
  await testUser.workspace.newWorkspaceWithPlan('team');
  const teamWorkspaceURL = testUser.page.url();

  await testUser.workspace.checkWorkspaceMember(testUser.email);
  await testUser.workspace.addWorkspaceMember(randomFreeUser.email, 'Editor');
  await testUser.workspace.createNewNotebook();
  await testUser.aiAssistant.closePannel();
  await testUser.notebook.waitForEditorToLoad();

  await test.step('standard editor member checks', async () => {
    await randomFreeUser.page.goto(teamWorkspaceURL);
    await randomFreeUser.workspace.waitWorkspaceLoad();
    await expect(
      randomFreeUser.workspace.settingsSection,
      'workspace editors shoudnt be able to access workspace settings'
    ).toBeHidden();
  });
});
