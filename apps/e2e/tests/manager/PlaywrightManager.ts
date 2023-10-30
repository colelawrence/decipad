/* eslint-disable no-use-before-define */
import { expect, Locator, Page } from '@playwright/test';
import { SlashCommand } from '../../../../libs/editor-types/src/index';
import { cleanText, Timeouts } from '../../utils/src';

const Selectors = {
  SpecificNotebook(title: string) {
    return `.notebookList > li:has-text("${title}")`;
  },
  NotebookTitle: '[data-slate-editor] h1',
  NotebookList: '.notebookList > li',
  NewNotebookTestId: 'new-notebook',
  ParagraphsId: 'paragraph-content',
  StructuredInUnitPickerId: '',
} as const;

/**
 *
 *
 *
 */
export class PlaywrightManager {
  public page: Page;

  public AdvancedCalc: AdvancedCalculationManager;
  public StructuredInput: StructuredInputManager;

  constructor(page: Page) {
    this.page = page;

    this.AdvancedCalc = new AdvancedCalculationManager(this);
    this.StructuredInput = new StructuredInputManager(this);
  }

  public async Setup(): Promise<void> {
    await this.page.goto('/');
  }

  public async SelectLastParagraph(): Promise<void> {
    await this.page.getByTestId(Selectors.ParagraphsId).last().click();
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
    // somethimes the first click misses
    await this.page.getByTestId(Selectors.ParagraphsId).last().click();
    await this.page.getByTestId(Selectors.ParagraphsId).last().click();
    // check paragraph is ready
    await expect(this.page.getByText('for new blocks')).toBeVisible();
    await this.page.keyboard.type(`/`);
    // checks menu had openned
    await this.page.getByRole('menu').isVisible();
    await this.page.getByTestId(`menu-item-${command}`).first().click();
  }

  /**
   * Returns the current offset of the cursor position.
   */
  public async GetCaretPosition(): Promise<number | undefined> {
    return this.page.evaluate('window.getSelection()?.anchorOffset');
  }

  /**
   * Returns contents of formula inspector
   */
  public async getFormulaInspectorContent(): Promise<string | undefined> {
    const content = await (
      await this.page.waitForSelector(`[data-testid=potential-formula]`)
    ).textContent();
    return content?.replace(/\u2060/gi, '');
  }

  /**
   * Returns contents of infline result (magic number)
   */
  public async getMagicNumberContent(): Promise<string | undefined> {
    const content = await (
      await this.page.waitForSelector(`[data-testid=magic-number]`)
    ).textContent();
    // TODO: we don't use zero-width spaces in magic numbers, so we can remove this
    return content?.replace(/\u2060/gi, '');
  }
}

interface BlockManager {
  manager: PlaywrightManager;
  Locator: Locator;
  Create: (...args: Array<string>) => void;
}

class AdvancedCalculationManager implements BlockManager {
  public manager: PlaywrightManager;
  public Locator: Locator;

  constructor(manager: PlaywrightManager) {
    this.manager = manager;
    this.Locator = manager.page.getByTestId('code-line');
  }

  public async Create(decilang: string): Promise<void> {
    await this.manager.UseSlashCommands('calculation-block');
    await this.manager.page.keyboard.type(decilang);
  }

  public async GetNthText(nth: number): Promise<string | undefined> {
    const content = await this.Locator.nth(nth).allTextContents();
    return cleanText(content.join());
  }
}

class StructuredInputManager implements BlockManager {
  public manager: PlaywrightManager;
  public Locator: Locator;
  public LocatorFormula: Locator;
  public UnitPicker: Locator;

  constructor(manager: PlaywrightManager) {
    this.manager = manager;
    this.Locator = manager.page.getByTestId('codeline-varname');
    this.LocatorFormula = manager.page.getByTestId('codeline-code');
    this.UnitPicker = manager.page.getByTestId('unit-picker-button');
  }

  public async Create(name: string, decilang: string): Promise<void> {
    const countStructuredInputs = await this.Locator.count();
    await this.manager.UseSlashCommands('structured-input');
    await expect(async () => {
      expect(await this.Locator.count()).toBe(countStructuredInputs + 1);
    }).toPass({
      timeout: 1000,
    });
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.manager.page.waitForTimeout(Timeouts.typing);
    await this.manager.page.keyboard.press('Tab');
    await this.manager.page.keyboard.type(decilang);
    await this.Locator.last().click();
    await this.Locator.last().dblclick();
    await this.manager.page.keyboard.type(name);
  }

  public async GetNthText(nth: number): Promise<string | undefined> {
    const content = await this.LocatorFormula.nth(nth).allTextContents();
    return cleanText(content.join());
  }
}

export async function PlaywrightManagerFactory(page: Page) {
  const manager = new PlaywrightManager(page);
  await manager.Setup();
  return manager;
}
