import retry from 'p-retry';
import { Page } from 'playwright-core';
import { timeout, withTestUser } from '../utils';
import { navigateToPlayground } from './Playground';
import { clickNewPadButton, navigateToWorkspacePage } from './Workspace';

interface SetupOptions {
  createAndNavigateToNewPad?: boolean;
  showChecklist?: boolean;
}

export async function waitForEditorToLoad(
  browserPage = page as Page,
  options: SetupOptions = { showChecklist: false }
) {
  try {
    await browserPage.waitForSelector('[contenteditable] h1', {
      timeout: 20_000,
    });

    // Hides the starter checklist and focuses on the body.
    // Otherwise the checklist would get in the way, and
    // after clicking we lose focus on title.
    if (!options.showChecklist) {
      const checklist = page.locator('text=Hide this forever');
      if ((await checklist.count()) > 0) {
        await browserPage.waitForSelector('text="Hide this forever"');
        const starterChecklist = browserPage.locator(
          'text="Hide this forever"'
        );
        await starterChecklist.click();
      }
    }

    await browserPage.locator('[contenteditable] h1').click();
  } catch {
    browserPage.reload();
    await browserPage.waitForSelector('[contenteditable] h1', {
      timeout: 20_000,
    });
  }
}

export async function setUp(options: SetupOptions = {}) {
  await page.goto('/api/auth/signout');
  const { createAndNavigateToNewPad = true } = options;
  await page.goto('/api/auth/signout');
  const newUser = await withTestUser();
  await retry(
    async () => {
      await navigateToWorkspacePage();
      if (createAndNavigateToNewPad) {
        await Promise.all([
          page.waitForNavigation({ url: '/n/*' }),
          clickNewPadButton(),
        ]);
        await waitForEditorToLoad(page as Page, options);
      }
    },
    { retries: 3 }
  );
  if (createAndNavigateToNewPad) {
    await page.click('[contenteditable] h1');
  }

  return newUser;
}

export async function goToPlayground() {
  await navigateToPlayground();
  await waitForEditorToLoad();
  await page.click('[contenteditable] h1');
}

export async function getPadName() {
  const $name = await page.$('[contenteditable] h1');
  expect($name).not.toBeNull();
  return (await $name!.textContent())!.trim();
}

export async function focusOnBody() {
  const firstP = await page.waitForSelector('[contenteditable] p >> nth=0');
  await firstP.click();
}

export async function waitForSaveFlush() {
  // TODO: this is bad. Should wait for local storage to flush instead.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5_010);
  await page.waitForLoadState('networkidle');
}

export async function keyPress(k: string) {
  await page.keyboard.press(k);
  await timeout(200);
}

export async function navigateToNotebook(notebookId: string) {
  await page.goto(`/n/pad-title:${notebookId}`);
}

export async function navigateToNotebookWithClassicUrl(
  notebookId: string,
  searchParams = ''
) {
  await page.goto(
    `/workspaces/ignoredWorkspaceId/pads/pad-title:${notebookId}${searchParams}`
  );
}
