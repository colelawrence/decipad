import retry from 'p-retry';
import { Page } from 'playwright-core';
import { timeout, withTestUser } from '../utils';
import { navigateToPlayground } from './Playground';
import { clickNewPadButton, navigateToWorkspacePage } from './Workspace';

interface SetupOptions {
  createAndNavigateToNewPad?: boolean;
}

export async function waitForEditorToLoad(browserPage = page as Page) {
  await browserPage.waitForSelector('[contenteditable] h1');
  try {
    await browserPage.waitForSelector('[contenteditable] h1', {
      timeout: 20_000,
    });
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
        await waitForEditorToLoad();
      }
    },
    { retries: 3 }
  );

  return newUser;
}

export async function goToPlayground() {
  await navigateToPlayground();
  await waitForEditorToLoad();
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
