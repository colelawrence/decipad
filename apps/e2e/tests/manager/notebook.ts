/* eslint-disable playwright/no-wait-for-selector */
import { type Locator, type Page, expect, test } from '@playwright/test';
import { cleanText, Timeouts } from '../../utils/src';
import { ControlPlus } from '../../utils/page/Editor';
import path from 'path';
import os from 'os';
import Zip from 'adm-zip';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import type {
  AvailableSwatchColor,
  SlashCommand,
  UserIconKey,
} from '@decipad/editor-types';

export class Notebook {
  readonly page: Page;
  readonly newTab: Locator;
  readonly tabOptionsMenu: Locator;
  readonly notebookTitle: Locator;
  readonly notebookParagraph: Locator;
  readonly notebookPlusBlockCommand: Locator;
  readonly formulaBlock: Locator;
  readonly advancedFomulaBlock: Locator;
  readonly formulaBlockUnitPicker: Locator;
  readonly formulaBlockCode: Locator;
  readonly notebookActions: Locator;
  readonly notebookStatus: Locator;
  readonly notebookIconButton: Locator;
  readonly notebookHelpButton: Locator;
  readonly archiveNotebook: Locator;
  readonly changeStatusMenu: Locator;
  readonly downloadNotebook: Locator;
  readonly restoreArchiveNotebook: Locator;
  readonly duplicateNotebook: Locator;
  readonly resultWidget: Locator;
  readonly topRightDuplicateNotebook: Locator;
  readonly republishNotification: Locator;
  readonly publishingSidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTab = page.getByTestId('add-tab-button');
    this.tabOptionsMenu = page.getByTestId('tab-options-menu');
    this.notebookTitle = page.getByTestId('notebook-title');
    this.notebookParagraph = page.getByTestId('paragraph-content');
    this.notebookPlusBlockCommand = page.getByTestId('plus-block-button');
    this.formulaBlock = page.getByTestId('codeline-varname');
    this.advancedFomulaBlock = page.getByTestId('code-line');
    this.formulaBlockUnitPicker = page.getByTestId('unit-picker-button');
    this.formulaBlockCode = page.getByTestId('codeline-code');
    this.notebookActions = page.getByTestId('notebook-actions');
    this.notebookStatus = page.getByTestId('notebook-status');
    this.notebookIconButton = page.getByTestId('notebook-icon');
    this.notebookHelpButton = page.getByTestId(
      'segment-button-trigger-top-bar-help'
    );
    this.archiveNotebook = page.getByRole('menuitem', {
      name: 'Archive Archive',
    });
    this.downloadNotebook = page.getByRole('menuitem', { name: 'Download' });
    this.duplicateNotebook = page.getByRole('menuitem', { name: 'Duplicate' });
    this.topRightDuplicateNotebook = page.getByTestId('duplicate-button');
    this.restoreArchiveNotebook = page.getByRole('menuitem', {
      name: 'Folder Open Unarchive',
    });
    this.resultWidget = page.getByTestId('result-widget');
    this.republishNotification = page.getByTestId('publish-notification');
    this.publishingSidebar = page.getByTestId('publishing-sidebar');
    this.changeStatusMenu = page.getByRole('menuitem', {
      name: 'Change Status',
    });
  }

  /**
   * Create new tab.
   *
   * **Usage**
   *
   * ```js
   *  await notebook.createTab();
   *  await notebook.createTab('Tab 5');
   * ```
   */
  async createTab(name: string | null = null) {
    await this.newTab.click();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.syncDelay);

    if (name) {
      await this.page.keyboard.type(name, { delay: 200 });
    }
    await this.page.keyboard.press('Enter');
  }

  /**
   * Check Default Notebook Icon
   *
   * **Usage**
   *
   * ```js
   *  await notebook.checkDefaultIcon();
   * ```
   */
  async checkDefaultIcon() {
    await test.step('check notebook icon', async () => {
      await expect(
        this.notebookIconButton.locator('title'),
        "Initial Notebook Icon isn't the Decipad Logo"
      ).toHaveText('Deci');
      const initialColor = await this.notebookIconButton.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      expect(initialColor, "Initial Notebook Icon isn't grey").toBe(
        'rgb(245, 247, 250)'
      ); // grey100
    });
  }

  /**
   * Open Notebook Icon Picker
   *
   * **Usage**
   *
   * ```js
   *  await notebook.openNotebookIconPicker();
   * ```
   */
  async openNotebookIconPicker() {
    await this.notebookIconButton.click();
    await expect(
      this.page.getByText('Pick a style'),
      "Icon picker menu didn't open"
    ).toBeVisible();
  }

  /**
   * Pick Notebook Icon Color
   *
   * **Usage**
   *
   * ```js
   *  await notebook.pickNotebookColor('Sulu');
   * ```
   */
  async pickNotebookColor(color: AvailableSwatchColor) {
    await this.page.getByTestId(`icon-color-picker-${color}`).click();

    await expect(async () => {
      const notebookIconColor = await this.notebookIconButton.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });
      // Todo: expand this in the future
      expect(notebookIconColor).toBe('rgb(230, 253, 196)');
    }).toPass();
  }

  /**
   * Pick Notebook Icon Color
   *
   * **Usage**
   *
   * ```js
   *  await notebook.pickNotebookColor('Sulu');
   * ```
   */
  async pickNotebookIcon(icon: UserIconKey) {
    await this.page.getByTestId(`icon-picker-${icon}`).click();
    await expect(
      this.notebookIconButton,
      "Notebook Icon didn't update"
    ).toHaveText(icon);
  }

  /**
   * Change Notebook Icon
   *
   * **Usage**
   *
   * ```js
   *  await notebook.changeNotebookIcon('Moon');
   * await notebook.changeNotebookIcon('Moon','Sulu');
   * ```
   */
  async changeNotebookIcon(icon: UserIconKey, color?: AvailableSwatchColor) {
    await test.step('changes notebook icon', async () => {
      await this.openNotebookIconPicker();
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (color) {
        await this.pickNotebookColor(color);
      }
      await this.pickNotebookIcon(icon);
    });
  }

  /**
   * Create multiple tabs.
   *
   * **Usage**
   *
   * ```js
   *  await notebook.createTabs(['Tab 2', 'Tab 3', 'Tab 4', 'Tab 5']);
   * ```
   */
  async createTabs(names: string[]) {
    for (const tabName of names) await this.createTab(tabName);
  }

  /**
   * Tab locator based on index or name.
   *
   * **Usage**
   *
   * ```js
   *  this.getTab('Tab 4').dblclick();
   * ```
   */
  private getTab(selector: string | number) {
    return typeof selector === 'string'
      ? this.page.getByRole('tab', { name: selector })
      : this.page.getByRole('tab').nth(selector);
  }
  /**
   * Rename notebook tab.
   *
   * **Usage**
   *
   * ```js
   *  await notebook.renameTab('New Tab', 'Tab 1');
   *  await notebook.renameTab('New Tab', 'Tab 1', { usingMenu: true });
   * ```
   */
  async renameTab(
    oldTab: string | number,
    newName: string,
    options: { usingMenu?: boolean } = { usingMenu: false }
  ) {
    if (options.usingMenu) {
      await this.getTab(oldTab).getByTestId('tab-options-button').click();
      await this.tabOptionsMenu.getByText('Rename Tab').click();
    } else {
      await this.getTab(oldTab).dblclick();
    }
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.syncDelay);

    await this.page.keyboard.type(newName, { delay: 200 });
    await this.page.keyboard.press('Enter');
  }

  /**
   * Get tab name with index.
   *
   * **Usage**
   *
   * ```js
   *  await notebook.getTabName(0)
   * ```
   */
  async getTabName(index = 0) {
    return this.page.getByTestId('tab-name').nth(index).textContent();
  }

  /**
   * Select notebook tab.
   *
   * **Usage**
   *
   * ```js
   *  await notebook.selectTab('Tab 5');
   *  await notebook.selectTab(0);
   * ```
   */
  async selectTab(selector: string | number) {
    await this.getTab(selector).click();
  }

  /**
   * Delete notebook tab.
   *
   * **Usage**
   *
   * ```js
   *  await notebook.deleteTab('Tab 5');
   *  await notebook.deleteTab(0);
   * ```
   */
  async deleteTab(selector: string | number) {
    await this.getTab(selector).getByTestId('tab-options-button').click();
    await this.page.getByTestId('tab-options-menu').getByText('Delete').click();
  }

  /**
   * Return array with notebook tab names.
   *
   * **Usage**
   *
   * ```js
   * await notebook.getTabNames()
   * ```
   * **Example**
   *
   * ```js
   * expect(await notebook.getTabNames()).toEqual([
   *  'Tab 1',
   *  'Tab 2',
   * ]);
   * ```
   */
  async getTabNames() {
    const tabsArray: string[] = [];
    for (const tabElement of await this.page
      .getByRole('tab')
      .getByTestId('tab-name')
      .all())
      tabsArray.push(await tabElement.innerText());

    return tabsArray;
  }
  /**
   * Make tab hidden to notebook readers.
   *
   * **Usage**
   *
   * ```js
   * await notebook.hideTab('Tab 5');
   * ```
   */
  async hideTab(selector: string | number) {
    await expect(this.getTab(selector).getByTestId('tab-icon')).toBeVisible();
    await this.getTab(selector).getByTestId('tab-options-button').click();
    await this.page
      .getByTestId('tab-options-menu')
      .getByText('Hide from reader')
      .click();
    await expect(this.getTab(selector).getByTestId('tab-icon')).toBeHidden();
    await expect(this.getTab(selector).getByTestId('tab-hidden')).toBeVisible();
  }

  /**
   * Make tab visible to notebook readers.
   *
   * **Usage**
   *
   * ```js
   * await notebook.showTab('Tab 5');
   * ```
   */
  async showTab(selector: string | number) {
    await expect(this.getTab(selector).getByTestId('tab-hidden')).toBeVisible();
    await this.getTab(selector).getByTestId('tab-options-button').click();
    await expect(
      this.page.getByRole('menuitem', { name: /Change icon/ })
    ).toBeDisabled();
    await this.page
      .getByTestId('tab-options-menu')
      .getByText('Show to reader')
      .click();
    await expect(this.getTab(selector).getByTestId('tab-hidden')).toBeHidden();
    await expect(this.getTab(selector).getByTestId('tab-icon')).toBeVisible();
  }

  /**
   * Changes tab icon.
   *
   * **Usage**
   *
   * ```js
   * await notebook.changeTabIcon('Tab 5', 'Announcement');
   * await notebook.changeTabIcon('Tab 5', 'Receipt', { withMenu: true });
   * ```
   */
  async changeTabIcon(
    selector: string | number,
    icon: UserIconKey,
    options: { usingMenu?: boolean } = { usingMenu: false }
  ) {
    if (options.usingMenu) {
      await this.getTab(selector).getByTestId('tab-options-button').click();
      await this.page.getByRole('menuitem', { name: /Change icon/ }).click();
    } else {
      await this.getTab(selector).getByTestId('tab-icon').click();
    }
    await this.page.getByTestId(`icon-picker-${icon}`).click();
    await expect(
      this.getTab(selector)
        .getByTestId('tab-icon')
        .getByRole('img', { name: icon })
    ).toBeVisible();
  }

  /**
   * Move tab to another position
   *
   * **Usage**
   *
   * ```js
   * await notebook.moveTab('Tab 4', 'Left');
   * ```
   */
  async moveTab(
    selector: string | number,
    option: 'Left' | 'Right' | 'To the start' | 'To the end'
  ) {
    await this.getTab(selector).getByTestId('tab-options-button').click();
    await this.page
      .getByTestId('tab-options-menu')
      .getByRole('menuitem', { name: /Move tab/ })
      .hover();
    await this.page
      .getByRole('menuitem', { name: new RegExp(`${option}$`) })
      .click();
  }

  /**
   * Move selected blocks to another tab.
   *
   * **Usage**
   *
   * ```js
   * await notebook.moveToTab(0, 'Tab 3');
   * ```
   */
  async moveToTab(blockIndex: number, tabName: string) {
    await this.page.getByTestId('drag-handle').nth(blockIndex).click();
    await this.page.getByRole('menuitem', { name: 'Move to tab' }).click();
    await this.page
      .getByTestId(/move-to-tab/)
      .filter({ hasText: tabName })
      .click();
  }

  /**
   * Cleck Sidebar is open.
   *
   * **Usage**
   *
   * ```js
   * await notebook.checkSidebarIsOpen();
   * ```
   */
  async checkSidebarIsOpen() {
    await expect(this.page.getByTestId('editor-sidebar')).toBeVisible();
  }

  /**
   * Open sidebar.
   *
   * **Usage**
   *
   * ```js
   * await notebook.openSidebar();
   * ```
   */
  async openSidebar() {
    if (await this.page.getByTestId('editor-sidebar').isHidden()) {
      await this.page
        .getByTestId('segment-button-trigger-top-bar-sidebar')
        .click();
      this.checkSidebarIsOpen();
    }
  }

  /**
   * Cleck Sidebar is closed.
   *
   * **Usage**
   *
   * ```js
   * await notebook.checkSidebarIsClosed();
   * ```
   */
  async checkSidebarIsClosed() {
    await expect(this.page.getByTestId('editor-sidebar')).toBeHidden();
  }

  /**
   * Close Sidebar.
   *
   * **Usage**
   *
   * ```js
   * await notebook.closeSidebar();
   * ```
   */
  async closeSidebar() {
    if (await this.page.getByTestId('editor-sidebar').isVisible()) {
      await this.page
        .getByTestId('segment-button-trigger-top-bar-sidebar')
        .click();
      await this.checkSidebarIsClosed();
    }
  }

  /**
   * Open Number Catalog.
   *
   * **Usage**
   *
   * ```js
   * await notebook.openNumberCatalog();
   * ```
   */
  async openNumberCatalog() {
    this.openSidebar();
    await this.page.getByTestId('sidebar-Data').click();
  }

  /**
   * Check notebook title.
   *
   * **Usage**
   *
   * ```js
   * await notebook.checkNotebookTitle('Welcome to Decipad!');
   * ```
   */
  async checkNotebookTitle(title: string) {
    await expect(this.notebookTitle).toHaveText(title);
  }

  /**
   * Change notebook title.
   *
   * **Usage**
   *
   * ```js
   * await notebook.updateNotebookTitle('Welcome to Decipad!');
   * ```
   */
  async updateNotebookTitle(title: string) {
    await expect(this.notebookTitle).toBeVisible();
    // make sure notebook is editable in 3s
    await this.notebookTitle.click({ timeout: 3000 });
    await ControlPlus(this.page, 'A');
    await this.page.keyboard.press('Delete');
    await this.notebookTitle.fill(title);
    await expect(this.notebookTitle).toHaveText(title);
    await expect(async () => {
      expect(await this.page.getByText(title.substring(0, 20)).count()).toEqual(
        2
      );
    }).toPass();
  }

  /**
   * Add notebook block with slash command.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addBlockShashCommand('table');
   * ```
   */
  async addBlockSlashCommand(
    command: SlashCommand,
    insertLastParagraph = true
  ) {
    await expect(async () => {
      if (insertLastParagraph) {
        this.selectLastParagraph();
      }
      await expect(this.page.getByText('for new blocks')).toBeVisible();
      await this.page
        .getByTestId('draggable-block')
        .filter({ hasText: 'for new blocks' })
        .click();
    }).toPass();
    // check paragraph is ready
    await this.page.keyboard.type(`/`);
    // checks menu had openned
    await expect(
      this.page.getByRole('menu'),
      'Block menu is visible'
    ).toBeVisible();
    await this.page.getByTestId(`menu-item-${command}`).first().click();
  }

  /**
   * Add notebook block with sidebar.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addBlockSidebar('table');
   * ```
   */
  async addBlockSidebar(command: SlashCommand) {
    // check if sidebar was close initially
    const isSidebarHidden = await this.page
      .getByTestId('editor-sidebar')
      .isHidden();
    if (isSidebarHidden) {
      await this.openSidebar();
    }
    // adds block to page
    await this.page.getByTestId(`menu-item-${command}`).first().click();

    // close sidebar if is was closed initially
    if (isSidebarHidden) {
      await this.closeSidebar();
    }
  }

  /**
   * Add notebook block with plus menu.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addBlockPlusBlockCommand('table');
   * ```
   */
  async addBlockPlusBlockCommand(command: SlashCommand) {
    await this.notebookPlusBlockCommand.last().click();
    await this.page.getByRole('menu').isVisible();
    await this.page.getByTestId(`menu-item-${command}`).first().click();
  }

  /**
   * Add notebook block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addBlock('table');
   * await notebook.addBlock('table', 'sidebar');
   * await notebook.addBlock('table', 'slashmenu');
   * ```
   */
  async addBlock(
    command: SlashCommand,
    menu: 'slashmenu' | 'sidebar' | 'plusblockmenu' = 'slashmenu',
    insertLastParagraph = true
  ) {
    switch (menu) {
      case 'sidebar':
        await this.addBlockSidebar(command);
        break;
      case 'plusblockmenu':
        await this.addBlockPlusBlockCommand(command);
        break;
      default:
        await this.addBlockSlashCommand(command, insertLastParagraph);
    }
  }

  /**
   * Add advanced formula block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addAdvancedFormula('num1 = 10');
   * ```
   */
  async addAdvancedFormula(expression: string) {
    const checkIncremented = await this.page.getByTestId('code-line').count();
    this.addBlock('calculation-block');
    await expect(async () => {
      await expect(await this.page.getByTestId('code-line').count()).toBe(
        checkIncremented + 1
      );
    }).toPass();

    await this.page.keyboard.type(expression);

    await this.page.waitForSelector('[data-testid="code-line"] >> nth=-1');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.computerDelay);
  }

  /**
   * Get advanced formula contents.
   *
   * **Usage**
   *
   * ```js
   * await notebook.getAdvancedFormulaContents(-1)
   * ```
   */
  async getAdvancedFormulaContents(nth: number) {
    const content = await this.advancedFomulaBlock.nth(nth).allTextContents();
    return cleanText(content.join());
  }

  /**
   * Get formula contents.
   *
   * **Usage**
   *
   * ```js
   * await notebook.getFormulaContents(-1)
   * ```
   */
  async getFormulaContents(nth: number) {
    const content = await this.formulaBlockCode.nth(nth).allTextContents();
    return cleanText(content.join());
  }

  /**
   * Returns the current offset of the cursor position.
   *
   * **Usage**
   *
   * ```js
   * await notebook.getCaretPosition();
   * ```
   */
  async getCaretPosition(): Promise<number | undefined> {
    return this.page.evaluate('window.getSelection()?.anchorOffset');
  }

  /**
   * Add table block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addTable();
   * ```
   */
  async addTable() {
    this.addBlock('table');
  }

  /**
   * Add Chart block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addChart();
   * ```
   */
  async addChart(
    type:
      | 'area-chart'
      | 'bar-chart'
      | 'line-chart'
      | 'pie-chart'
      | 'scatter-plot' = 'area-chart'
  ) {
    this.addBlock(type);
  }

  /**
   * Add Blockquote block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addBlockquote();
   * ```
   */
  async addBlockquote() {
    this.addBlock('blockquote');
  }

  /**
   * Add Callout block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addCallout();
   * ```
   */
  async addCallout() {
    this.addBlock('callout');
  }

  /**
   * Add Data View block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addDataView();
   * ```
   */
  async addDataView() {
    this.addBlock('data-view');
  }

  /**
   * Add Date Picker Widget.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addDatePickerWidget();
   * ```
   */
  async addDatePickerWidget(name?: string) {
    await this.addBlock('datepicker');

    if (name) {
      await this.page
        .locator('[data-testid="widget-caption"] >> text=/Input/')
        .last()
        .dblclick();

      await this.page.keyboard.press('Backspace');

      await this.page.keyboard.type(name);
    }
  }

  /**
   * Add Display Widget.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addDisplayWidget();
   * ```
   */
  async addDisplayWidget() {
    this.addBlock('display');
  }

  /**
   * Add Notebook Divider.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addDivider();
   * ```
   */
  async addDivider() {
    this.addBlock('divider');
  }

  /**
   * Add Dropdown Widget.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addDropdownWidget();
   * ```
   */
  async addDropdownWidget() {
    this.addBlock('dropdown');
  }

  /**
   * Get all Dropdown options.
   *
   * **Usage**
   *
   * ```js
   * await notebook.getDropdownOptions()
   * ```
   * **Example**
   *
   * ```js
   * expect(await notebook.getDropdownOptions()).toEqual(['50%', '75%']);
   * ```
   */
  async getDropdownOptions() {
    const dropdownOptionsArray: string[] = [];
    for (const tabElement of await this.page
      .getByTestId('dropdown-option')
      .all()) {
      dropdownOptionsArray.push(await tabElement.innerText());
    }

    return dropdownOptionsArray;
  }

  /**
   * Check Dropdown option is selected.
   *
   * This is a hacky solution since current dropdown aren't using the [selected attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select)
   *
   * **Usage**
   *
   * ```js
   * await notebook.checkDropdownOptionIsSelected('Hello')
   * ```
   */
  async checkDropdownOptionIsSelected(option: string) {
    await expect(
      this.page.getByTestId('dropdown-option').filter({ hasText: option }),
      `Dropdown did't have "${option}" selected`
    ).toHaveCSS('background-color', 'rgb(245, 247, 250)');
  }

  /**
   * Validate Dropdown options without caring for display order.
   *
   * **Usage**
   *
   * ```js
   * await notebook.checkDropdownOptions()
   * ```
   * **Example**
   *
   * ```js
   *  await notebook.checkDropdownOptions(['Hello', 'World']);
   * ```
   */
  async checkDropdownOptions(options: string[]) {
    const dropdownOptionsArray = await this.getDropdownOptions();
    // make sure all the dropdown options are displayed and don't care about its order, the lenght should also be the same.
    expect(dropdownOptionsArray).toEqual(expect.arrayContaining(options));
    expect(dropdownOptionsArray.length).toEqual(options.length);
  }

  /**
   * Select Dropdown Option
   *
   * **Usage**
   *
   * ```js
   * await notebook.selectDropdownOption()
   * ```
   */
  async selectDropdownOption(option: string) {
    this.page
      .getByTestId('dropdown-option')
      .filter({ hasText: option })
      .click();
  }

  /**
   * Get Result Widget Display Value Option
   *
   * **Usage**
   *
   * ```js
   * await notebook.getResultWidgetValue('Hello')
   * ```
   */
  async getResultWidgetValue(widgetName: string) {
    return this.page
      .getByTestId('widget-editor')
      .filter({ hasText: widgetName })
      .getByTestId('result-widget')
      .innerText();
  }

  /**
   * Add Heading Block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addHeadding();
   * ```
   */
  async addHeadding() {
    this.addBlock('heading1');
  }

  /**
   * Add Sub Heading Block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addSubHeadding();
   * ```
   */
  async addSubHeadding() {
    this.addBlock('heading2');
  }

  /**
   * Add Input Widget.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addInputWidget();
   * ```
   */
  async addInputWidget(identifier: string, value: number | string) {
    this.addBlock('input');

    await this.page
      .locator('[data-testid="widget-caption"] >> text=/Input/')
      .last()
      .dblclick();

    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.type(identifier);

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.tableDelay);

    await this.page.click('div [data-testid="input-widget-name"] >> nth=-1');
    await this.page.keyboard.press('ArrowDown');
    // erase 100$, then focus goes to title, we come back down
    await this.page.keyboard.press('End');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace');

    await this.page.keyboard.type(value.toString());
  }

  /**
   * Open Image uploader.
   *
   * **Usage**
   *
   * ```js
   * await notebook.openImageUploader(insertLastParagraph = true);
   * ```
   */
  async openImageUploader(insertLastParagraph = true) {
    this.addBlock('upload-image', undefined, insertLastParagraph);
    await expect(async () => {
      await expect(this.page.getByText('Add an image')).toBeVisible();
    }, `Embed Image modal didn't open`).toPass();
    await this.page.getByTestId('upload-file-tab').click();
  }

  /**
   * Add Image to Notebook.
   *
   * replicate util to be implemented
   * unsplash util to be implemented
   * giphy util to be implemented
   *
   * **Usage**
   *
   * ```js
   * await notebook.addImage({
          method: 'link',
          link: './__fixtures__/images/download.png',
        });
   * ```
   */
  async addImage(
    option:
      | { method: 'upload'; file: string }
      | { method: 'link'; link: string }
      | { method: 'replicate'; prompt: string }
      | { method: 'unsplash'; prompt: string }
      | { method: 'giphy'; prompt: string },
    insertAtCurrentBlock = false
  ) {
    switch (option.method) {
      case 'upload':
        await test.step('Importing image through file explorer', async () => {
          await this.openImageUploader(insertAtCurrentBlock);
          const fileChooserPromise = this.page.waitForEvent('filechooser');
          await this.page.getByText('Choose file').click();
          const fileChooser = await fileChooserPromise;
          await fileChooser.setFiles(option.file);
          await expect(
            this.page.getByTestId('notebook-image-block').locator('img')
          ).toBeVisible();
        });
        break;
      case 'link':
        await test.step('Importing image via link', async () => {
          await this.openImageUploader(insertAtCurrentBlock);
          await this.page.getByTestId('link-file-tab').click();
          await this.page
            .getByPlaceholder('Paste the image link here')
            .fill(option.link);
          await this.page.getByRole('button', { name: 'Insert image' }).click();
          await expect(
            this.page.getByTestId('notebook-image-block').locator('img')
          ).toBeVisible();
        });
        break;
      case 'replicate':
        // replicate util to be implemented
        test.fail();
        break;
      case 'unsplash':
        // unsplsh util to be implemented
        test.fail();
        break;
      case 'giphy':
        // giphy util to be implemented
        test.fail();
        break;
      default:
        this.addImage({
          method: 'link',
          link: './__fixtures__/images/download.png',
        });
    }
  }

  /**
   * Add Embed to Notebook.
   *
   *
   * **Usage**
   *
   * ```js
 await notebook.addEmbed(
    'https://www.loom.com/embed/fdd9cc32f4b2494ca4e4e4420795d2e0?sid=e1964b86-c0a2-424c-8b12-df108627ecd2'
  );
   * ```
   */
  async addEmbed(link: string) {
    await this.openEmbedUploader();
    await this.page.getByPlaceholder('Paste the embed link here').fill(link);
    await this.page.getByRole('button', { name: 'insert embed' }).click();
  }

  /**
   * Add CSV to Notebook.
   *
   *
   * **Usage**
   *
   * ```js
 await notebook.addCSV({
      method: 'upload',
      file: './__fixtures__/csv/accounts.csv',
    });
   * ```
   */
  async addCSV(
    option:
      | { method: 'upload'; file: string }
      | { method: 'link'; link: string }
  ) {
    switch (option.method) {
      case 'upload':
        await test.step('Importing csv through file explorer', async () => {
          await this.openCSVUploader();
          await this.page.getByTestId('upload-file-tab').click();
          await this.page.getByRole('button', { name: 'Choose file' }).click();
          const fileChooserPromise = this.page.waitForEvent('filechooser');
          await this.page.getByText('Choose file').click();
          const fileChooser = await fileChooserPromise;
          await fileChooser.setFiles(option.file);
        });
        break;
      case 'link':
        await test.step('Importing csv via link', async () => {
          await this.openCSVUploader();
          await this.page.getByTestId('link-file-tab').click();
          await this.page
            .getByPlaceholder('Paste the data link here')
            .fill(option.link);
          await this.page.getByRole('button', { name: 'insert data' }).click();
        });
        break;
      default:
        this.addCSV({
          method: 'link',
          link: './__fixtures__/images/download.png',
        });
    }
  }

  /**
   * Open Embed uploader.
   *
   * **Usage**
   *
   * ```js
   * await notebook.openEmbedUploader();
   * ```
   */
  async openEmbedUploader() {
    this.addBlock('upload-embed');
    await expect(async () => {
      await expect(this.page.getByText('Embed URL')).toBeVisible();
    }, `Embed URL Modal didn't open.`).toPass();
  }

  /**
   * Open CSV uploader.
   *
   * **Usage**
   *
   * ```js
   * await notebook.openCSVUploader();
   * ```
   */
  async openCSVUploader() {
    this.addBlock('upload-csv');
  }

  /**
   * Add Sketch Block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addSketch();
   * ```
   */
  async addSketch() {
    this.addBlock('sketch');
  }

  /**
   * Add Slider Widget.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addSliderWidget();
   * ```
   */
  async addSliderWidget() {
    this.addBlock('slider');
  }

  /**
   * Add Toogle Widget.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addToggleWidget();
   * ```
   */
  async addToggleWidget() {
    this.addBlock('toggle');
  }

  /**
   * Add Formula Block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addFormula();
   * ```
   */
  async addFormula(variableName?: string, formulaExpression?: string) {
    const countStructuredInputs = await this.formulaBlock.count();
    await this.addBlock('structured-code-line');
    await expect(async () => {
      expect(await this.formulaBlock.count()).toBe(countStructuredInputs + 1);
    }).toPass({
      timeout: 1000,
    });
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.typing);
    await this.page.keyboard.press('Tab');
    if (formulaExpression) {
      await this.page.keyboard.type(formulaExpression);
    }
    await this.formulaBlock.last().click();
    await this.formulaBlock.last().dblclick();
    if (variableName) {
      await this.page.keyboard.type(variableName);
    }
  }

  /**
   * FIX: Add paragraph.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addParagraph();
   * ```
   */
  async addParagraph(text: string) {
    await this.focusOnBody(-1);
    const paragraphNumber = await this.notebookParagraph.count();
    await this.page.keyboard.type(text);
    await expect(this.notebookParagraph.nth(paragraphNumber - 1)).toHaveText(
      text
    );
  }

  /**
   * Add Number Block.
   *
   * **Usage**
   *
   * ```js
   * await notebook.addNumber();
   * ```
   */
  async addNumber() {
    this.addBlock('structured-input');
  }

  /**
   * Wait for Notebook Editor to load.
   *
   * **Usage**
   *
   * ```js
   * await notebook.waitForEditorToLoad();
   * ```
   */
  async waitForEditorToLoad() {
    await expect(async () => {
      await expect(this.notebookTitle).toBeVisible();
    }).toPass();
    await this.notebookTitle.click();
  }

  /**
   * Publish current notebook.
   *
   * **Usage**
   *
   * ```js
   * await notebook.publishNotebook();
   * ```
   */
  async publishNotebook(notebookTitle?: string) {
    await this.openPublishingSidebar();

    await this.page.getByTestId('publish-tab').click();

    await this.page.getByTestId('publish-dropdown').click();
    await this.page.getByTestId('publish-public').click();
    await this.page.getByTestId('publish-changes').click();

    await this.page.getByTestId('copy-published-link').click();
    const clipboardText = (
      (await this.page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    if (notebookTitle) {
      expect(clipboardText).toContain('Welcome-to-Decipad');
    }
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.syncDelay);
    return clipboardText;
  }

  async publishPrivateURL(): Promise<void> {
    await this.openPublishingSidebar();

    await this.page.getByTestId('publish-tab').click();

    await this.page.getByTestId('publish-dropdown').click();
    await this.page.getByTestId('publish-private-url').click();
    await this.page.getByTestId('publish-changes').click();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.syncDelay);
  }

  /**
   * Publish notebook changes
   *
   * **Usage**
   *
   * ```js
   * await notebook.publishNotebookChanges();
   * ```
   */
  async publishNotebookChanges() {
    await this.openPublishingSidebar();
    await expect(
      this.republishNotification,
      "Publish changes notification insn't visible"
    ).toBeVisible();
    await this.page.getByTestId('publish-changes').click();
    await expect(
      this.page.getByTestId('publish-changes'),
      "Publish changes button didn't go away after publishing changes"
    ).toBeHidden();
    await expect(
      this.republishNotification,
      "Publish changes notification didn't go away after publishing changes"
    ).toBeHidden();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.computerDelay);
  }

  /**
   * Click on pragraph to focus on notebook body.
   *
   * **Usage**
   *
   * ```js
   * await notebook.focusOnBody();
   * await notebook.focusOnBody(5);
   * ```
   */
  async focusOnBody(paragraphNumber = 0) {
    const p = await this.page.waitForSelector(
      `[data-testid="paragraph-wrapper"] >> nth=${paragraphNumber}`
    );
    await p.click();
    return this.page.getByTestId('paragraph-wrapper').count();
  }

  /**
   * Select multiple notebook blocks.
   *
   * **Usage**
   *
   * ```js
   * await notebook.selectBlocks(0, 2);
   * ```
   */
  async selectBlocks(startBlock: number, endBlock: number) {
    const [startBoxLocation, endBoxLocation] = await Promise.all([
      this.page
        .locator(`[data-testid="drag-handle"] >> nth=${startBlock}`)
        .boundingBox(),
      this.page
        .locator(`[data-testid="drag-handle"] >> nth=${endBlock}`)
        .boundingBox(),
    ]);

    const width = this.page.viewportSize()?.width;
    const startMousePosition = {
      x: startBoxLocation!.x / 2,
      y: startBoxLocation!.y,
    };

    const endMouseLocation = {
      x: endBoxLocation!.x + width! / 2,
      y: endBoxLocation!.y,
    };

    await this.page.mouse.move(startMousePosition.x, startMousePosition.y);
    await this.page.mouse.down();
    await this.page.mouse.move(endMouseLocation.x, endMouseLocation.y);
    await this.page.mouse.up();
  }

  async selectLastParagraph() {
    await this.notebookParagraph.last().click();
  }

  /**
   * Returns contents of formula inspector.
   *
   * **Usage**
   *
   * ```js
   * await notebook.getFormulaInspectorContent();
   * ```
   */
  async getFormulaInspectorContent(): Promise<string | undefined> {
    const content = await (
      await this.page.waitForSelector(`[data-testid=potential-formula]`)
    ).textContent();
    return content?.replace(/\u2060/gi, '');
  }
  /**
   *Returns contents of infline result (magic number)
   *
   * **Usage**
   *
   * ```js
   * await notebook.getMagicNumberContent();
   * ```
   */
  async getMagicNumberContent(): Promise<string | undefined> {
    const content = await (
      await this.page.waitForSelector(`[data-testid=magic-number]`)
    ).textContent();
    // TODO: we don't use zero-width spaces in magic numbers, so we can remove this
    return content?.replace(/\u2060/gi, '');
  }
  /**
   *Returns contents of infline result (magic number)
   *
   * **Usage**
   *
   * ```js
   * await notebook.changeStatus('Review');
   * ```
   */
  async changeStatus(newSatus: 'Draft' | 'Review' | 'Approval' | 'Done') {
    await this.notebookActions.click();
    await this.changeStatusMenu.click();
    await this.page.getByRole('menuitem', { name: newSatus }).click();
    // check menu closed
    await expect(this.changeStatusMenu).toBeHidden();
  }
  /**
   * Achive notebook using options menu.
   *
   * **Usage**
   *
   * ```js
   * await notebook.archive();
   * ```
   */
  async archive() {
    await this.notebookActions.click();
    await this.archiveNotebook.click();
    await expect(
      this.page.locator('text="Successfully archived notebook."')
    ).toBeVisible();
  }

  async waitForDownload(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        this.page.once('download', async (download) => {
          try {
            const filePath = path.join(os.tmpdir(), nanoid());
            await download.saveAs(filePath);
            resolve(await readFile(filePath));
          } catch (err) {
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Download notebook using options menu.
   *
   * **Usage**
   *
   * ```js
   * await notebook.download();
   * ```
   */
  async download() {
    await this.notebookActions.click();
    const exportButton = (await this.page.waitForSelector(
      'div[role="menuitem"] span:has-text("Download")'
    ))!;
    const [fileContent] = await Promise.all([
      this.waitForDownload(),
      exportButton.click(),
    ]);
    const zip = new Zip(fileContent);
    const jsonEntry = zip.getEntry('notebook.json');
    if (!jsonEntry) {
      throw new Error('expected a notebook.json entry on the export');
    }
    const json = jsonEntry.getData();
    return json.toString('utf8');
  }

  /**
   * Return to workspace using the button on the notebook topbar
   *
   */
  async returnToWorkspace() {
    await this.page.getByTestId('go-to-workspace').click();
    await expect(this.page.getByTestId('new-notebook')).toBeVisible();
  }

  /**
   * Duplicate notebook using options menu.
   *
   * **Usage**
   *
   * ```js
   * await notebook.duplicate();
   * ```
   */
  async duplicate(workspace?: string) {
    await this.notebookActions.click();
    await this.duplicateNotebook.click();

    if (workspace) {
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
   * Remove from notebook from.
   *
   * **Usage**
   *
   * ```js
   * await notebook.unarchive();
   * ```
   */
  async unarchive() {
    await this.notebookActions.click();
    await expect(this.archiveNotebook).toBeHidden();
    await this.restoreArchiveNotebook.click();

    // check menu updated
    await this.notebookActions.click();
    await expect(this.restoreArchiveNotebook).toBeHidden();
    await expect(this.archiveNotebook).toBeVisible();
    await this.page.mouse.click(0, 0);
  }
  /**
   * Invite collaborator to notebook
   *
   * **Usage**
   *
   * ```js
   * await inviteUser('test-email@gmal.com')
   * ```
   */
  async inviteUser(email: string, role: 'reader' | 'editor') {
    if (!(await this.publishingSidebar.isVisible())) {
      await this.page.getByRole('button', { name: 'Share' }).click();
    }

    await this.page.getByPlaceholder('Enter email address').fill(email);

    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');

    switch (role) {
      case 'editor':
        await this.page.getByTestId('notebook-editor').click();
        break;
      case 'reader':
        await this.page.getByTestId('notebook-reader').click();
        break;
    }

    await this.page.getByTestId('send-invitation').click();
    await this.focusOnBody();
  }

  /**
   * Opens the publishing sidebar
   *
   * Or it doesn't do anything if the publishing sidebar is already opened.
   *
   */
  public async openPublishingSidebar(): Promise<void> {
    if (await this.isPublishingSidebarOpen()) {
      return;
    }
    await this.page.getByRole('button', { name: 'Share ' }).click();
  }

  public async isPublishingSidebarOpen(): Promise<boolean> {
    return this.publishingSidebar.isVisible();
  }

  /**
   * Create Notebook Embed
   *
   * **Usage**
   *
   * ```js
   * await inviteNotebookCollaborator('test-email@gmal.com')
   * ```
   */
  async createEmbed(notebookTitle?: string) {
    await this.publishNotebook(notebookTitle);

    await this.openPublishingSidebar();

    await this.page.getByTestId('embed-tab').click();
    await this.page.getByTestId('copy-published-link').click();
    const clipboardText = (
      (await this.page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    if (notebookTitle) {
      expect(clipboardText).toContain('Welcome-to-Decipad');
    }
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(Timeouts.syncDelay);
    return clipboardText;
  }

  async updateSlider(name: string, value: string) {
    const sliderInput = this.getSliderLocator(name);
    await sliderInput.waitFor({ state: 'visible' });

    // Selection sometimes isn't selected fully by a single click.
    await sliderInput.click();
    await sliderInput.click();

    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.type(value);
  }

  async deleteBlock(index: number) {
    await this.page.getByTestId('drag-handle').nth(index).click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
  }

  async duplicateBlock(index: number) {
    await this.page.getByTestId('drag-handle').nth(index).click();
    await this.page.getByRole('menuitem', { name: 'Duplicate' }).click();
  }

  async copyBlockReference(index: number) {
    await this.page.getByTestId('drag-handle').nth(index).click();
    await this.page
      .getByRole('menuitem', { name: 'copy reference link' })
      .click();
    const clipboardText = (
      (await this.page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    return clipboardText;
  }

  /**
   * Return the locator to a dropdown with a specific name
   *
   * **Usage**
   *
   * ```js
      let Dropdown = notebook.getDropdownLocator('SliderName')
   * ```
   */
  getDropdownLocator(name: string) {
    return this.page
      .getByTestId('widget-editor')
      .filter({ hasText: new RegExp(name) });
  }

  /**
   * Return the locator to a slider with a specific name
   *
   * **Usage**
   *
   * ```js
      let SliderValue = notebook.getSliderLocator('SliderName').getByTestId('widget-input');
   * ```
   */
  getSliderLocator(name: string) {
    return this.page
      .getByTestId('widget-editor')
      .filter({ hasText: new RegExp(name) });
  }

  /**
   * Return the locator to a value of a slider with a specific name
   *
   * **Usage**
   *
   * ```js
   * await expect(
      notebook.getSliderValueLocator('PriceUnit')
    ).toContainText('20$');
   * ```
   */
  getSliderValueLocator(name: string) {
    return this.getSliderLocator(name).getByTestId('widget-input');
  }

  /**
   * Check notebook has calculation errors
   */
  async checkCalculationErrors() {
    await test.step(`Check errors`, async () => {
      await expect(async () => {
        // check for errors in calculations
        await expect(
          this.page.getByTestId('code-line-warning'),
          `calculation errors visible`
        ).toBeHidden();

        // check for error blocks
        await expect(
          this.page.getByTestId('error-block'),
          `broken blocks visible`
        ).toBeHidden();

        // check for results that didn't load or magic errors, the code base uses loading-results & loading-animation
        await expect(
          this.page.getByTestId('loading-results'),
          `loading blocks visible`
        ).toBeHidden();

        // check if integrations get stuck loading, the code base uses loading-results & loading-animation
        await expect(
          this.page.getByTestId('loading-animation'),
          `loading blocks visible`
        ).toBeHidden();
      }).toPass({
        intervals: [4_000],
        timeout: 20_000,
      });
    });
  }
}
