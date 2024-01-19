import {
  type Locator,
  type Page,
  expect,
  type ElementHandle,
} from '@playwright/test';

// 90 seconds.
const LONG_TIMEOUT = 90000;

interface Pad {
  anchor: ElementHandle;
  name: string;
  href: string | null;
}

type PadList = Pad[];

export class Workspace {
  readonly page: Page;
  readonly workspaceSelector: Locator;
  readonly createWorkspaceButton: Locator;
  readonly workspaceHeroName: Locator;
  baseWorkspaceID: string;
  readonly notebookLabel: Locator;
  readonly modalCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.workspaceSelector = this.page.getByTestId('workspace-selector-button');
    this.createWorkspaceButton = this.page.getByTestId(
      'create-workspace-button'
    );
    this.workspaceHeroName = this.page.getByTestId('workspace-hero-title');
    this.baseWorkspaceID = '';
    this.notebookLabel = page.getByTestId('notebook-section-tag');
    this.modalCloseButton = page.getByTestId('closable-modal');
  }

  /**
   * Create new workspace.
   *
   * **Usage**
   *
   * ```js
   *  newWorkspaceURL = workspace.newWorkspace('New Workspace Name');
   * ```
   */
  async newWorkspace(name: string) {
    await this.workspaceSelector.click();
    await this.createWorkspaceButton.click();
    await this.page.getByPlaceholder('Team workspace').click();
    await this.page.getByPlaceholder('Team workspace').fill(name);
    await this.page.getByRole('button', { name: 'Create Workspace' }).click();
    await expect(this.workspaceHeroName).toHaveText(`Welcome to${name}`);
    return this.page.url();
  }

  /**
   * Update default Workspace ID
   *
   * **Usage**
   *
   * ```js
   *  newWorkspaceURL = workspace.newWorkspace('New Workspace Name');
   * ```
   */
  async updateDefaultWorkspaceID(ID: string) {
    this.baseWorkspaceID = ID;
  }

  /**
   * Check for notebook label
   *
   * **Usage**
   *
   * ```js
   *  await workspace.checkLabel('Drag and Drop Test');
   * ```
   */
  async checkLabel(label: string) {
    await expect(
      await this.notebookLabel.filter({
        hasText: label,
      })
    ).toBeVisible();
  }

  /**
   * Create a new section in the workspace
   *
   * @param {string} name - Name of the section
   * @param {number} [options.colourIndex=-1] - Colour index of the section
   * @param {boolean} [options.create=true] - Whether to create the section or not. If not created modal will still be open after execution.
   *
   * **Usage**
   * ```js
   * await workspace.newSection('Section Name');
   *
   * // with colour
   * await workspace.newSection('Section Name', { colourIndex: 2 });
   *
   * // without creating
   * await workspace.newSection('Section Name', { create: false });
   * ```
   */
  async newSection(
    name: string,
    options: { colourIndex?: number; create?: boolean } = {
      colourIndex: -1,
      create: true,
    }
  ) {
    await this.page
      .getByTestId('new-section-button')
      .click({ timeout: LONG_TIMEOUT });
    await this.page.getByPlaceholder('My section').fill(name);
    if (options.colourIndex && options.colourIndex > 1) {
      await this.page
        .getByTestId('color-section-button')
        .nth(options.colourIndex)
        .click();
    }
    if (options.create === false) return;
    await this.page.getByRole('button', { name: 'Create Section' }).click();
    await expect(this.page.getByText(name)).toBeVisible();
  }

  /**
   * Search for a notebook in workspace
   *
   * @param {string} [value=23] - value to be searched
   *
   * **Usage**
   * ```js
   * await workspace.searchForNotebook('Notebook Name');
   * ```
   */
  async searchForNotebook(value: string) {
    await this.page.getByTestId('search-bar').click();
    await this.page.getByTestId('search-bar').pressSequentially(value);
  }

  /**
   * Move notebook from current section to another section
   * @param {string} notebookName - Name of the notebook to be moved
   * @param {string} sectionName - Name of the section to move the notebook to
   *
   * **Usage**
   * ```js
   * await workspace.moveNotebookToSection('Notebook Name', 'Section Name');
   * ```
   */
  async moveNotebookToSection(notebookName: string, sectionName: string) {
    await this.page
      .getByTestId('notebook-list-item')
      .getByText(notebookName)
      .hover();
    await this.page.mouse.down();
    await this.page.getByText(sectionName).hover();
    await this.page.mouse.up();
  }

  /**
   * Change the active section in workspace
   * @param {string} sectionName - Name of the section to be selected
   */
  async selectSection(sectionName: string) {
    await this.page
      .getByTestId('navigation-list-item')
      .getByText(sectionName)
      .click();
  }

  /**
   * Get the list of notepad in the current workspace
   * @param {boolean} [sortByName=false] return a sorted list of notepad by name
   */
  async getPadList(sortByName = false): Promise<PadList> {
    // wait for notebooks to show up
    await this.page.waitForSelector('//main//li//a//strong');

    // eslint-disable-next-line playwright/no-element-handle
    const names = await this.page.$$('//main//li//a//strong');
    const pads: PadList = [];
    for (const name of names) {
      const anchor = (await name.evaluateHandle(
        (elem) => elem.closest('a')!
      )) as ElementHandle;
      pads.push({
        anchor,
        name: (await name.textContent()) ?? '',
        href: await anchor.getAttribute('href'),
      });
    }

    if (sortByName) {
      return pads.sort((a, b) => a.name.localeCompare(b.name));
    }
    return pads;
  }

  /**
   * Remove pad from current workspace
   * @param {number} [index=0] index of the notepad to be removed
   */
  async removePad(index = 0) {
    await this.page.click(this.ellipsisSelector(index));
    const removeButton = await this.page.waitForSelector(
      'div[role="menuitem"] span:has-text("Archive")'
    );
    await Promise.all([
      this.page.waitForRequest('/graphql'),
      removeButton.click(),
    ]);
  }

  ellipsisSelector(n: number): string {
    return `//main//li >> nth=${n} >> div[type=button] svg`;
  }

  /**
   * Duplicate pad from current workspace
   * @param {number} [index=0] index of notepad to be duplicated
   * @param {string} [workspace=''] name of the workspace to copy the notepad to
   */
  async duplicatePad(index = 0, workspace = '') {
    await this.page.click(this.ellipsisSelector(index));
    await this.page.getByText('Duplicate').click();
    // accounts with multiple workspaces have an extra menu to select where to copy
    if (workspace !== '') {
      const selectDuplicateWorkspace = this.page
        .locator(`div[role="menuitem"] span:has-text("${workspace}")`)
        .first();
      await Promise.all([
        this.page.waitForRequest('/graphql'),
        selectDuplicateWorkspace.click(),
      ]);
    }
  }

  /**
   * Archive notepad, if index not specified first notepad will be archived
   * @param {number} [index=0] index of notepad to be archived
   */
  async archivePad(index = 0) {
    await this.page.click(this.ellipsisSelector(index));
    await this.page.click('div[role="menuitem"] span:has-text("Archive")');
  }

  /**
   * Open archive tab in workspace
   */
  async openArchive() {
    await this.page.click('aside nav > ul > li a span:has-text("Archived")');
  }

  /**
   * Delete notepad, should be called when in archive, if index not specified first notepad will be deleted
   * @param {number} [index=0] index of notepad to be deleted
   */
  async deleteNotepad(index = 0) {
    await this.page.click(this.ellipsisSelector(index));
    await this.page.click('div[role="menuitem"] span:has-text("Delete")');
  }

  /**
   * Open account settings modal
   */
  async openAccountSettings() {
    await this.page.getByTestId('account-settings-button').click();
  }

  /**
   * close and save account settings modal
   */
  async closeAccountSettings() {
    await this.page.getByTestId('btn-create-modal').click();
  }

  /**
   * update values in account settings
   * @param {string} [name=null] value to update the name field
   * @param {string} [username=null] value to update the username field
   */
  async updateAccountSettings({
    name = null as null | string,
    username = null as null | string,
  }) {
    await this.openAccountSettings();
    if (name) {
      await this.page.getByTestId('user-name').fill(name);
    }

    if (username) {
      await this.page.getByTestId('user-username').fill(username);
    }

    await this.closeAccountSettings();
  }

  /**
   * Click new pad button
   */
  async clickNewPadButton() {
    await this.page.getByTestId('new-notebook').click();
  }

  /**
   * Ivite user to the current workspace
   * @param email - email of user to add
   * @param role - role of user to add
   */
  async addWorkspaceMember(email: string, role: 'Admin' | 'Member' = 'Member') {
    await this.page.getByTestId('manage-workspace-members').click();
    await this.page.locator('input[type="email"]').fill(email);

    if (role === 'Admin') {
      await this.page.getByTestId('text-icon-button:member').first().click();
      await this.page.getByText('Workspace admin').click();
    }
    await this.page.getByText('Send invitation').click();
    await expect(async () => {
      await this.page.getByTestId('closable-modal').click();
      await expect(
        this.page.getByTestId('manage-workspace-members')
      ).toBeVisible();
    }).toPass();
  }
}
