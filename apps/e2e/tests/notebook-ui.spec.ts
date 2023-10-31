import { expect, Page, BrowserContext, test } from '@playwright/test';
import { PlaywrightManagerFactory } from './manager';
import { snapshot, Timeouts, withTestUser } from '../utils/src';
import {
  focusOnBody,
  ControlPlus,
  waitForEditorToLoad,
  setUp,
} from '../utils/page/Editor';
import { clickNewPadButton } from '../utils/page/Workspace';

import { createTab, getTabName, selectTab } from 'apps/e2e/utils/page/Tab';
import {
  createCalculationBlockBelow,
  moveToTab,
  selectBlocks,
} from 'apps/e2e/utils/page/Block';

test.describe('notebook ui interactions @notebook @ui', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('notebook actions topbar', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await test.step('Changes the status of the notebook', async () => {
      const actions = page.getByTestId('notebook-actions');
      const notebookStatus = page.getByTestId('notebook-status');

      await expect(actions).toBeVisible();
      await expect(notebookStatus).toBeVisible();
      await expect(notebookStatus).toHaveText('Draft');

      await actions.click();

      const changeStatus = page.locator('text="Change Status"');

      await changeStatus.click();

      const review = page.locator('[role="menuitem"]:has-text("Review")');
      await review.click();

      // They hide after you click the review option.
      await expect(changeStatus).toBeHidden();
      await expect(review).toBeHidden();
      await expect(notebookStatus).toHaveText('review');
    });

    await test.step('Change status again', async () => {
      const actions = page.getByTestId('notebook-actions');
      const notebookStatus = page.getByTestId('notebook-status');

      await expect(actions).toBeVisible();
      await expect(notebookStatus).toBeVisible();
      await expect(notebookStatus).toHaveText('review');

      await actions.click();

      const changeStatus = page.locator('text="Change Status"');

      await changeStatus.click();

      const review = page.locator('[role="menuitem"]:has-text("Done")');
      await review.click();

      // They hide after you click the review option.
      await expect(changeStatus).toBeHidden();
      await expect(review).toBeHidden();
      await expect(notebookStatus).toHaveText('done');
    });

    await test.step('Can archive and unarchive notebook', async () => {
      const actions = page.getByTestId('notebook-actions');

      await actions.click();
      const archive = page.locator('[role="menuitem"]:has-text("Archive")');

      await archive.click();

      const archiveMessage = page.locator(
        'text="Successfully archived notebook."'
      );
      await expect(archiveMessage).toBeVisible();

      await actions.click();

      const putBack = page.locator('[role="menuitem"]:has-text("Put back")');
      await expect(putBack).toBeVisible();
      await expect(archive).toBeHidden();
      await putBack.click();

      await actions.click();
      await expect(putBack).toBeHidden();
      await expect(archive).toBeVisible();
      // Make sure to close it!
      await page.mouse.click(0, 0);
    });

    await test.step('Can download notebook', async () => {
      const actions = page.getByTestId('notebook-actions');

      await actions.click();
      const download = page.locator('[role="menuitem"]:has-text("Download")');

      const downloadPromise = page.waitForEvent('download');
      await download.click();
      const notebookFile = await downloadPromise;
      const err = await notebookFile.failure();
      expect(err).toBeNull();
    });
  });

  test('notebook icon', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await test.step('renders the initial color and icon', async () => {
      const notebookIconButton = page.getByTestId('notebook-icon');

      await expect(notebookIconButton.locator('title')).toHaveText(
        'Decipad Logo'
      );
      const initialColor = await notebookIconButton.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      expect(initialColor).toBe('rgb(245, 247, 250)'); // grey100
    });

    await test.step('changes notebook icon', async () => {
      await page.locator('button[aria-haspopup="dialog"]').click();
      await page.getByTestId('icon-picker-Moon').click();

      await expect(
        page.locator('button[aria-haspopup="dialog"] title')
      ).toHaveText('Moon');
    });

    await test.step('changes the color of the notebook icon', async () => {
      await page.locator('button[aria-haspopup="dialog"]').click();
      await page.getByTestId('icon-color-picker-Sulu').click();
      await expect(page.getByText('Pick a style')).toBeVisible();
      await snapshot(page as Page, 'Notebook: Icon selection');
    });
  });

  test('notebook help button @support', async ({ page, context }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await test.step('checks releses', async () => {
      await page.getByTestId('segment-button-trigger-top-bar-help').click();
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        await page.getByTestId('releases-link').click(),
      ]);
      expect(newPage.url()).toMatch(/.*\/docs\/releases/);
    });
    await test.step('checks docs', async () => {
      await page.getByTestId('segment-button-trigger-top-bar-help').click();
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        await page.getByTestId('docs-link').click(),
      ]);
      expect(newPage.url()).toMatch(/.*\/docs/);
    });

    await test.step('join discord link works', async () => {
      await page.getByTestId('segment-button-trigger-top-bar-help').click();
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        await page.getByTestId('discord-link').click(),
      ]);
      expect(newPage.url()).toMatch('https://discord.com/invite/decipad');
    });
  });

  test('basic tabs funcionality @tabs', async ({ page }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();

    await test.step('check new notebook first tab', async () => {
      await focusOnBody(page);
      await page.keyboard.type('this is the first paragraph on the first tab');
      await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
        'this is the first paragraph on the first tab'
      );
      await expect(page.getByTestId('tab-name')).toHaveText('New Tab');
    });

    await test.step('rename first tab', async () => {
      await page.getByTestId('tab-options-button').click();
      await expect(page.getByTestId('tab-options-menu')).toBeVisible();
      await page
        .getByTestId('tab-options-menu')
        .getByText('Rename Tab')
        .click();
      ControlPlus(page, 'a');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('First Tab');
      await page.keyboard.press('Enter');
    });

    await test.step('add second tab', async () => {
      await page.getByTestId('add-tab-button').click();
      await page.keyboard.press('Enter');
      await expect(await page.getByTestId('tab-button').count()).toBe(2);
    });

    await test.step('check second tab does not have text and adds new paragraph', async () => {
      await focusOnBody(page);
      await expect(page.getByTestId('paragraph-content')).toHaveText('');
      await expect(page.getByTestId('paragraph-wrapper').nth(0)).not.toHaveText(
        'this is the first paragraph on the first tab'
      );
      await page.keyboard.type('this is the first paragraph on the second tab');
      await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
        'this is the first paragraph on the second tab'
      );
    });

    await test.step('check first tab still has original text', async () => {
      await page.getByTestId('tab-button').first().click();
      await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
        'this is the first paragraph on the first tab'
      );
    });

    await test.step('delete second tab', async () => {
      // goes to second tab named New Tab
      await page.getByTestId('tab-button').getByText('New Tab').click();
      await page.getByTestId('tab-options-button').nth(1).click();
      await expect(page.getByTestId('tab-options-menu')).toBeVisible();
      await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
        'this is the first paragraph on the second tab'
      );
      await page.getByTestId('tab-options-menu').getByText('Delete').click();
      // check it goes to first tab after delition second tab
      await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
        'this is the first paragraph on the first tab'
      );
      await expect(await page.getByTestId('tab-button').count()).toBe(1);
    });
  });

  test('sidebar in publish views @sidebar', async ({ page, browser }) => {
    const manager = await PlaywrightManagerFactory(page);
    await manager.CreateAndNavNewNotebook();
    let sharedPageLocation: string | null;
    let randomUser: BrowserContext;
    let randomPage: Page;

    await test.step('publish notebook', async () => {
      await page.getByRole('button', { name: 'Share' }).click();
      await page.getByTestId('publish-tab').click();
      await page.locator('[aria-roledescription="enable publishing"]').click();
      // eslint-disable-next-line playwright/no-networkidle
      await page.waitForLoadState('networkidle');
      await page.getByTestId('copy-published-link').click();
      const clipboardText = (
        (await page.evaluate('navigator.clipboard.readText()')) as string
      ).toString();
      expect(clipboardText).toContain('Welcome-to-Decipad');
      sharedPageLocation = clipboardText;
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.syncDelay);
    });

    await test.step('[another user] navigates to published notebook link', async () => {
      randomUser = await browser.newContext();
      randomUser.clearCookies();
      randomPage = await randomUser.newPage();
      await withTestUser({ context: randomUser, page: randomPage });
    });

    await test.step('[another user] create notebook and open sidebar', async () => {
      await clickNewPadButton(randomPage);
      await waitForEditorToLoad(randomPage);
      await expect(randomPage.getByTestId('editor-sidebar')).toBeHidden();
      await randomPage
        .getByTestId('segment-button-trigger-top-bar-sidebar')
        .click();
      await expect(randomPage.getByTestId('editor-sidebar')).toBeVisible();
    });

    await test.step('[another user] check sidebar open in a published notebook from another user', async () => {
      await randomPage.goto(sharedPageLocation!);
      await waitForEditorToLoad(randomPage);
      await expect(randomPage.getByTestId('editor-sidebar')).toBeHidden();
    });
  });
});

test.describe('using multiple tabs', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Create a new tab', async () => {
    await createTab(page, 'Tab 1');
    await createTab(page, 'Tab 2');
    await createTab(page, 'Tab 3');
    await selectTab(page, 0);

    const [tab, tab1, tab2, tab3] = await Promise.all([
      getTabName(page, 0),
      getTabName(page, 1),
      getTabName(page, 2),
      getTabName(page, 3),
    ]);

    expect(tab).toContain('New Tab');
    expect(tab1).toContain('Tab 1');
    expect(tab2).toContain('Tab 2');
    expect(tab3).toContain('Tab 3');
  });

  test('Create blocks', async () => {
    await focusOnBody(page);
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.type(`Block ${i}`);
      await page.keyboard.press('Enter');
    }
  });

  test('Move single block to different tab', async () => {
    await moveToTab(page, 0, 0);
    await selectTab(page, 1);
    const blockText = await page
      .locator('[data-testid="paragraph-wrapper"] >> nth=0')
      .innerText();
    expect(blockText).toContain('Block 0');
  });

  test('Move multiple blocks to different tab', async () => {
    await selectTab(page, 0);
    await selectBlocks(page, 0, 2);
    await moveToTab(page, 0, 1);
    await selectTab(page, 2);

    const [block1, block2, block3] = await Promise.all([
      page.locator('[data-testid="paragraph-wrapper"] >> nth=0').innerText(),
      page.locator('[data-testid="paragraph-wrapper"] >> nth=1').innerText(),
      page.locator('[data-testid="paragraph-wrapper"] >> nth=2').innerText(),
    ]);

    expect(block1).toContain('Block 1');
    expect(block2).toContain('Block 2');
    expect(block3).toContain('Block 3');
  });

  test('Move calculation based blocks to different tab', async () => {
    await selectTab(page, 3);
    await createCalculationBlockBelow(page, 'num1 = 10');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num2 = 20');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num1 + num2');
    await moveToTab(page, 2, 0);

    await expect(
      page.getByTestId('code-line').first().getByTestId('number-result:10')
    ).toBeVisible();
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    await selectTab(page, 0);

    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeVisible();
  });
});
