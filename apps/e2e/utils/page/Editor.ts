import { Flag } from '@decipad/feature-flags';
import { BrowserContext, Page } from '@playwright/test';
import { Timeouts, withTestUser } from '../src';
import { signOut } from './Home';
import { isOnPlayground, navigateToPlayground } from './Playground';
import { clickNewPadButton, navigateToWorkspacePage } from './Workspace';

interface SetupOptions {
  createAndNavigateToNewPad?: boolean;
  featureFlags?: Record<Flag, boolean>;
}

export async function waitForEditorToLoad(page: Page) {
  await page.waitForSelector('[data-testid="notebook-title"]', {
    timeout: 50_000,
  });
  await page.locator('[data-testid="notebook-title"]').click({
    timeout: 50_000,
  });
  if (!isOnPlayground(page)) {
    if (await page.isVisible('text=/clear all/i')) {
      await page.click('text=/clear all/i');
      await page.locator('[data-testid="notebook-title"]').click({
        timeout: 50_000,
      });
    }
  }
}

export async function waitForNotebookToLoad(page: Page) {
  await page.waitForSelector('[data-testid="notebook-title"]', {
    timeout: 50_000,
  });
}

interface SetupProps {
  page: Page;
  context: BrowserContext;
}

function isOnNotebook(page: Page | URL): boolean {
  const url = page instanceof URL ? page : new URL(page.url());
  return url.pathname.match(/\/n\//) !== null;
}

export async function setUp(
  { page, context }: SetupProps,
  options: SetupOptions = {}
) {
  await signOut(page);
  const { createAndNavigateToNewPad = true, featureFlags } = options;
  const newUser = await withTestUser({ page, context });
  await navigateToWorkspacePage(page);
  if (createAndNavigateToNewPad) {
    await Promise.all([
      page.waitForNavigation({ url: isOnNotebook }),
      clickNewPadButton(page),
    ]);
    await waitForEditorToLoad(page);
  }
  if (featureFlags) {
    const url = new URL(page.url());
    for (const [flagName, value] of Object.entries(featureFlags)) {
      url.searchParams.set(flagName, value.toString());
    }
    page.goto(url.toString());
    await waitForEditorToLoad(page);
  }
  if (createAndNavigateToNewPad) {
    await page.waitForSelector('[data-slate-editor] h1');
  } else {
    // workspace
    await page.waitForSelector('.notebookList > li');
  }

  return newUser;
}

export async function goToPlayground(page: Page) {
  await navigateToPlayground(page);
  await waitForEditorToLoad(page);
  await page.click('[data-slate-editor] h1');
}

export async function getPadName(page: Page) {
  await page.waitForSelector('[data-slate-editor] h1');
  // eslint-disable-next-line playwright/no-element-handle
  const name = await page.$('[data-slate-editor] h1');
  return (await name!.textContent())!.trim();
}

export async function focusOnBody(page: Page, paragraphNumber = 0) {
  const p = await page.waitForSelector(
    `[data-testid="paragraph-wrapper"] >> nth=${paragraphNumber}`
  );
  await p.click();
}

export async function keyPress(page: Page, k: string) {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);
  await page.keyboard.press(k);
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(Timeouts.typing);
}

export async function ControlPlus(page: Page, key: string) {
  const isMac = process.platform === 'darwin';
  const modifier = isMac ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+Key${key.toLocaleUpperCase()}`);
}

export async function navigateToNotebook(page: Page, notebookId: string) {
  await page.goto(`/n/pad-title:${notebookId}`);
}

export async function navigateToNotebookWithClassicUrl(
  page: Page,
  notebookId: string,
  searchParams = ''
) {
  await page.goto(
    `/workspaces/ignoredWorkspaceId/pads/pad-title:${notebookId}${searchParams}`
  );
}
