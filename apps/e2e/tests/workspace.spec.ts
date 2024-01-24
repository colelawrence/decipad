import { expect, test, Page } from './manager/decipad-tests';
import { snapshot } from '../utils/src';

test('Section creation', async ({ randomFreeUser }) => {
  const { page, workspace } = randomFreeUser;
  await test.step('Creating a new section', async () => {
    await workspace.newSection('Section Creation Test 1', { colourIndex: 2 });
  });

  await test.step('Cancelling a new section', async () => {
    await workspace.newSection('Section Creation Test 1', { create: false });
    await workspace.modalCloseButton.click();
    await expect(page.getByText('Section Creation Test 2')).toBeHidden();
  });
});

test('workspace sections', async ({ randomFreeUser }) => {
  const { page, workspace } = randomFreeUser;

  await test.step('new workspacsection', async () => {
    await workspace.newSection('Drag and Drop Test');

    // Navigating back to My Notebooks
    await expect(async () => {
      await page.getByTestId('my-notebooks-button').click();
      await expect(page.getByText('No documents to list')).toBeHidden();
    }).toPass();
  });

  await test.step('Searching on the search bar and dragging the notebook', async () => {
    await expect(async () => {
      await expect(page.getByTestId('workspace-hero-title')).toBeVisible();
    }).toPass();
    await workspace.searchForNotebook('Welcome to Decipad!');

    await workspace.moveNotebookToSection(
      'Welcome to Decipad!',
      'Drag and Drop Test'
    );
  });

  await test.step('Checking if the right notebook was dragged into the section', async () => {
    workspace.selectSection('Drag and Drop Test');
    await expect(
      page.getByTestId('notebook-list-item').getByText('Welcome to Decipad!')
    ).toBeVisible();

    // check section labels are visible with filter
    await workspace.checkLabel('Drag and Drop Test');

    // check section label are persistant on reload
    await page.reload();
    await workspace.checkLabel('Drag and Drop Test');

    // check standard view showcases notebook labels
    await expect(async () => {
      await page.getByTestId('my-notebooks-button').click();
      await workspace.checkLabel('Drag and Drop Test');
    }).toPass();
  });

  await test.step('Checking if the no search result warning banner is displayed', async () => {
    await expect(page.getByTestId('no-correct-search-result')).toBeHidden();
  });
});

const byName = (a: { name: string }, b: { name: string }): number => {
  return a.name.localeCompare(b.name);
};

test('should display the initial notebooks', async ({
  randomFreeUser: { page, workspace },
}) => {
  const pads = await workspace.getPadList(true);

  // eslint-disable-next-line no-unused-expressions, playwright/no-conditional-in-test
  process.env.CI || process.env.DECI_E2E
    ? expect(pads).toMatchObject(
        [
          'Welcome to Decipad!',
          'Starting a Business - Example Notebook',
          'Weekend Trip - Example Notebook',
        ]
          .map((notebook) => ({ name: notebook }))
          .sort(byName)
      )
    : expect(pads).toMatchObject(
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
          .map((notebook) => ({ name: notebook }))
          .sort(byName)
      );

  await snapshot(page as Page, 'Dashboard: Initial Notebooks');
});

test.use({ colorScheme: 'dark' });
test('shows workspace in dark mode mode', async ({
  randomFreeUser: { page },
}) => {
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

test.use({ colorScheme: 'light' });
test('shows workspace in light mode mode', async ({
  randomFreeUser: { page },
}) => {
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

test('Dashboard operations', async ({
  randomFreeUser: { page, workspace },
}) => {
  await test.step('creates a new pad and navigates to pad detail', async () => {
    await Promise.all([
      workspace.clickNewPadButton(),
      page.waitForNavigation({ url: '/n/*' }),
    ]);

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

test('Workspace flows', async ({ randomFreeUser: { page, workspace } }) => {
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

test('workspace permissions', async ({
  premiumUser,
  randomFreeUser,
  anotherRandomFreeUser,
}) => {
  test.slow();
  let premiumWorkspaceId: string;
  await test.step('premium user is premium', async () => {
    await premiumUser.goToWorkspace();
    premiumWorkspaceId = (
      await premiumUser.workspace.newWorkspace('Premium Workspace@n1n.co')
    )
      .split('/')
      .at(-1)!;
    await premiumUser.page.reload();
  });

  await test.step('invite member and admin', async () => {
    await premiumUser.workspace.addWorkspaceMember(randomFreeUser.email);
    await premiumUser.workspace.addWorkspaceMember(
      anotherRandomFreeUser.email,
      'Admin'
    );
    await premiumUser.createAndNavNewNotebook(premiumWorkspaceId);
    await premiumUser.notebook.updateNotebookTitle('Test Notepad');
    await premiumUser.notebook.checkNotebookTitle('Test Notepad');
    await premiumUser.goToWorkspace(premiumWorkspaceId);
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

    await randomFreeUser.page.getByTestId('publish-button').click();
    await expect(
      randomFreeUser.page.getByText(
        'Request access to have more sharing options'
      )
    ).toBeVisible();
  });

  await test.step('standard member checks', async () => {
    await anotherRandomFreeUser.goToWorkspace(premiumWorkspaceId);
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

test('reader and collaborator permissions', async ({
  premiumUser,
  randomFreeUser,
  anotherRandomFreeUser,
}) => {
  let notebook: string;

  await test.step('invite reader and collaborator to notebook', async () => {
    await premiumUser.createAndNavNewNotebook();
    await premiumUser.notebook.inviteUser(randomFreeUser.email, 'reader');
    await premiumUser.notebook.inviteUser(
      anotherRandomFreeUser.email,
      'collaborator'
    );
    notebook = premiumUser.page.url();
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
        'Request access to have more sharing options'
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
