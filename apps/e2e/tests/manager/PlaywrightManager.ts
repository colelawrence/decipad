import { Page } from '@playwright/test';
import { SlashCommand } from '../../../../libs/editor-types/src/index';

const Selectors = {
  SpecificNotebook(title: string) {
    return `.notebookList > li:has-text("${title}")`;
  },
  NotebookTitle: '[data-slate-editor] h1',
  NotebookList: '.notebookList > li',
  NewNotebookTestId: 'new-notebook',
  LastParagraph: '',
} as const;

/**
 *
 *
 *
 */
export class PlaywrightManager {
  public page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async Setup(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Goes to default workspace.
   */
  public async GoToWorkspace(): Promise<void> {
    const isOnWorkspace = await this.IsOnWorkspace();
    if (!isOnWorkspace) {
      await this.page.goto('/');
    }
    await this.page.waitForSelector(Selectors.NotebookList);
  }

  /**
   * Navigates to a notebook of a specific title on the current workspace,
   * No need to navigate to workspace before.
   */
  public async GoToNotebook(notebookTitle: string): Promise<void> {
    if (!this.IsOnWorkspace()) {
      await this.page.goto('/');
    }

    await this.page.locator(Selectors.SpecificNotebook(notebookTitle)).click();

    await this.page.waitForSelector(Selectors.NotebookTitle);
  }

  /**
   * Creates and navigates to a new notebook.
   */
  public async CreateAndNavNewNotebook(): Promise<void> {
    await this.GoToWorkspace();
    await this.page.getByTestId(Selectors.NewNotebookTestId).click();
    await this.page.waitForSelector(Selectors.NotebookTitle);
  }

  /**
   * Checks if we are currently in the workspace,
   * by matching the URL
   */
  public async IsOnWorkspace(): Promise<boolean> {
    const url = this.page.url();
    return url.match(/\/w\//) !== null;
  }

  /**
   * Goes to the last paragraph and uses the slash command
   */
  public async UseSlashCommands(command: SlashCommand): Promise<void> {
    await this.page.locator(Selectors.LastParagraph).click();
    await this.page.keyboard.type(command);
    await this.page.keyboard.press('Enter');
  }
}

export async function PlaywrightManagerFactory(
  page: Page
): Promise<PlaywrightManager> {
  const manager = new PlaywrightManager(page);
  await manager.Setup();

  return manager;
}
