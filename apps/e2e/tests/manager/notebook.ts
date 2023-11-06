import { type Locator, type Page, expect } from '@playwright/test';

export class Notebook {
  readonly page: Page;
  readonly newTab: Locator;
  readonly tabOptionsMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTab = page.getByTestId('add-tab-button');
    this.tabOptionsMenu = page.getByTestId('tab-options-menu');
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
   *
   */
  async createTab(name: string | null = null) {
    await this.newTab.click();

    if (name) {
      await this.page.keyboard.type(name);
    }
    await this.page.keyboard.press('Enter');
  }

  /**
   * Create multiple tabs.
   *
   * **Usage**
   *
   * ```js
   *  await notebook.createTabs(['Tab 2', 'Tab 3', 'Tab 4', 'Tab 5']);
   * ```
   *
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
   *
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
   *
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
    await this.page.keyboard.type(newName);
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
   *
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
   *
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
   *
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
   *
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
   *
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
   *
   */
  async changeTabIcon(
    selector: string | number,
    icon: string,
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
   *
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
   * Move selected blocks to another tab
   *
   * **Usage**
   *
   * ```js
   * await notebook.moveToTab(0, 'Tab 3');
   * ```
   *
   */
  async moveToTab(blockIndex: number, tabName: string) {
    await this.page.getByTestId('drag-handle').nth(blockIndex).click();
    await this.page.getByRole('menuitem', { name: 'Move to tab' }).click();
    await this.page
      .getByTestId(/move-to-tab/)
      .filter({ hasText: tabName })
      .click();
  }
}
