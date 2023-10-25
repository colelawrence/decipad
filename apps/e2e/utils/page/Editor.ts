import { Flag } from '@decipad/feature-flags';
import { expect, BrowserContext, Page } from '@playwright/test';
import {
  Timeouts,
  genericTestEmail,
  withTestUser,
  createWorkspace,
  importNotebook,
} from '../src';
import { isOnPlayground, navigateToPlayground } from './Playground';
import { navigateToWorkspacePage } from './Workspace';
import stringify from 'json-stringify-safe';
import emptyNotebook from '../../__fixtures__/010-empty-notebook.json';

interface SetupOptions {
  createAndNavigateToNewPad?: boolean;
  featureFlags?: Partial<Record<Flag, boolean>>;
  randomUser?: boolean;
}

export const editorLocator = (): string => {
  return '[data-editorloaded][data-hydrated]';
};

export const editorTitleLocator = (): string => {
  return `[data-testid="notebook-title"]`;
};

export async function waitForEditorToLoad(page: Page) {
  await expect(async () => {
    await expect(page.getByTestId('notebook-title')).toBeVisible();
  }).toPass();
  await page.getByTestId('notebook-title').click();
  if (!isOnPlayground(page)) {
    if (await page.isVisible('text=/clear all/i')) {
      await page.click('text=/clear all/i');
      await page.locator(editorTitleLocator()).first().click({
        timeout: Timeouts.maxSelectorWaitTime,
      });
      // since we have changed the title, we need to move the cursor the to the end of the text
      await page.keyboard.press('ArrowRight');
    }
  }
}

export async function waitForNotebookToLoad(page: Page) {
  await expect(async () => {
    await expect(page.getByTestId('notebook-title')).toBeVisible();
  }).toPass();
}

interface SetupProps {
  page: Page;
  context: BrowserContext;
}

export async function navigateToNotebook(page: Page, notebookId: string) {
  await page.goto(`/n/pad-title:${notebookId}`);
}

export async function setUp(
  { page, context }: SetupProps,
  options: SetupOptions = {}
) {
  const {
    createAndNavigateToNewPad = true,
    featureFlags,
    randomUser = false,
  } = options;

  const newUser = randomUser
    ? await withTestUser({ page, context })
    : genericTestEmail();

  if (featureFlags) {
    const url = new URL(page.url());
    for (const [flagName, value] of Object.entries(featureFlags)) {
      url.searchParams.set(flagName, value.toString());
    }
    page.goto(url.toString());
    await waitForEditorToLoad(page);
  }

  if (createAndNavigateToNewPad) {
    const workspaceId = await createWorkspace(page);
    const notebookId = await importNotebook(
      workspaceId,
      Buffer.from(stringify(emptyNotebook), 'utf-8').toString('base64'),
      page
    );
    await navigateToNotebook(page, notebookId);
    await waitForEditorToLoad(page);
  } else {
    // workspace
    await navigateToWorkspacePage(page);
  }

  return newUser;
}

export async function goToPlayground(page: Page) {
  await navigateToPlayground(page);
  await waitForEditorToLoad(page);
  await page.click('[data-slate-editor] h1');
}

export async function getPadName(page: Page) {
  await page.waitForSelector(editorTitleLocator());
  // eslint-disable-next-line playwright/no-element-handle
  const name = await page.$('[data-slate-editor] h1');
  return (await name?.textContent())?.trim();
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
