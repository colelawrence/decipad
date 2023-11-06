import { expect, Page, BrowserContext, test } from './manager/decipad-tests';
import { PlaywrightManagerFactory } from './manager';
import { snapshot, Timeouts, withTestUser } from '../utils/src';
import { focusOnBody, waitForEditorToLoad } from '../utils/page/Editor';
import { clickNewPadButton } from '../utils/page/Workspace';

import {
  createCalculationBlockBelow,
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

test('basic tabs funcionality @tabs', async ({ page, notebook }) => {
  const manager = await PlaywrightManagerFactory(page);
  await manager.CreateAndNavNewNotebook();

  await test.step('create 4 new tabs tabs called Tab #', async () => {
    await notebook.createTabs(['Tab 2', 'Tab 3', 'Tab 4', 'Tab 5']);

    // 5 total tabs = initial tab + 4 created
    expect(await notebook.getTabNames()).toEqual([
      'New Tab',
      'Tab 2',
      'Tab 3',
      'Tab 4',
      'Tab 5',
    ]);
  });

  await test.step('change Tab 5 icon', async () => {
    await notebook.hideTab('Tab 5');
    await notebook.showTab('Tab 5');
    await notebook.changeTabIcon('Tab 5', 'Announcement');
    await notebook.changeTabIcon('Tab 5', 'Receipt', { usingMenu: true });
  });

  await test.step('rename first tab to Tab 1', async () => {
    await notebook.selectTab('New Tab');
    await notebook.renameTab('New Tab', 'Tab 1');
    await expect(await notebook.getTabName(0)).toContain('Tab 1');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
      'Tab 5',
    ]);
  });

  await test.step('add text paragraphs to Tab 1', async () => {
    await focusOnBody(page);

    // paragraph
    await page.keyboard.type(`Block 1`);
    await page.keyboard.press('Enter');

    // quote
    await page.keyboard.type(`>`);
    await page.keyboard.press('Space');
    await page.keyboard.type('Block 2');
    await page.keyboard.press('Enter');

    // title
    await page.keyboard.type('#');
    await page.keyboard.press('Space');
    await page.keyboard.type('Block 3');
    await page.keyboard.press('Enter');

    // paragraph
    await page.keyboard.type(`Block 4`);
    await page.keyboard.press('Enter');

    await expect(await page.getByText(/Block \d+/).count()).toBe(4);
  });

  await test.step('check Tab 2 is empty', async () => {
    await notebook.selectTab('Tab 2');
    await focusOnBody(page);
    await expect(page.getByTestId('paragraph-content')).toHaveText('');
    await expect(await page.getByText(/Block \d+/).count()).toBe(0);
    await notebook.selectTab('Tab 1');
    await expect(await page.getByText(/Block \d+/).count()).toBe(4);
  });

  await test.step('move single paragraph from Tab 1 to Tab 2', async () => {
    await notebook.selectTab('Tab 1');
    await notebook.moveToTab(0, 'Tab 2');
    await notebook.selectTab('Tab 2');
    const block1 = await page
      .getByTestId('paragraph-content')
      .nth(0)
      .innerText();
    expect(block1).toContain('Block 1');
  });

  await test.step('move multiple blocks from Tab 1 to Tab 3', async () => {
    await notebook.selectTab('Tab 1');
    await selectBlocks(page, 0, 2);
    await notebook.moveToTab(0, 'Tab 3');
    await notebook.selectTab('Tab 3');

    expect(await page.getByRole('blockquote').innerText()).toContain('Block 2');
    expect(await page.getByRole('heading').innerText()).toContain('Block 3');
    expect(
      await page.getByTestId('paragraph-wrapper').first().innerText()
    ).toContain('Block 4');
  });

  await test.step('create advanced calculations in Tab 4 to move to Tab 5', async () => {
    await notebook.selectTab('Tab 4');
    await createCalculationBlockBelow(page, 'num1 = 10');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num2 = 20');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('num1 + num2');
    await notebook.moveToTab(2, 'Tab 5');

    await expect(
      page.getByTestId('code-line').first().getByTestId('number-result:10')
    ).toBeVisible();
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    await notebook.selectTab('Tab 5');

    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeVisible();
  });

  await test.step('delete tab 5', async () => {
    // check something from Tab 4 isn't visible
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeHidden();

    await notebook.selectTab('Tab 5');
    await notebook.deleteTab('Tab 5');

    // check something from Tab 4 is visible since Tab 5 has been deleted and Tab 4 has been selected in its place
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:20')
    ).toBeVisible();

    // check something from Tab 5 doesn't exist anymore
    await expect(
      page.getByTestId('code-line').last().getByTestId('number-result:30')
    ).toBeHidden();

    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
  });

  await test.step('move tab 4', async () => {
    await notebook.moveTab('Tab 4', 'Left');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 4',
      'Tab 3',
    ]);
    await notebook.moveTab('Tab 4', 'Right');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
    await notebook.moveTab('Tab 4', 'To the start');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 4',
      'Tab 1',
      'Tab 2',
      'Tab 3',
    ]);
    await notebook.moveTab('Tab 4', 'To the end');
    expect(await notebook.getTabNames()).toEqual([
      'Tab 1',
      'Tab 2',
      'Tab 3',
      'Tab 4',
    ]);
  });
});
