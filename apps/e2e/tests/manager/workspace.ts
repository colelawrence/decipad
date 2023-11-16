import { type Locator, type Page, expect } from '@playwright/test';

export class Workspace {
  readonly page: Page;
  readonly workspaceSelector: Locator;
  readonly createWorkspaceButton: Locator;
  readonly workspaceHeroName: Locator;
  baseWorkspaceID: string;
  readonly notebookLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.workspaceSelector = this.page.getByTestId('workspace-selector-button');
    this.createWorkspaceButton = this.page.getByTestId(
      'create-workspace-button'
    );
    this.workspaceHeroName = this.page.getByTestId('workspace-hero-title');
    this.baseWorkspaceID = '';
    this.notebookLabel = page.getByTestId('notebook-section-tag');
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
}
