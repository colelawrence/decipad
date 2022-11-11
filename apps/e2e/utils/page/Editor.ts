import { Page, BrowserContext } from 'playwright';
import { Timeouts, withTestUser } from '../src';
import { signOut } from './Home';
import { navigateToPlayground } from './Playground';
import { clickNewPadButton, navigateToWorkspacePage } from './Workspace';

interface SetupOptions {
  createAndNavigateToNewPad?: boolean;
  showChecklist?: boolean;
}

export async function waitForEditorToLoad(
  page: Page,
  options: SetupOptions = { showChecklist: false }
) {
  await page.waitForSelector('[data-slate-editor] h1', {
    timeout: 20_000,
  });

  if (!options.showChecklist) {
    const checklist = page.locator('text=Hide this forever');
    if ((await checklist.count()) > 0) {
      await page.waitForSelector('text="Hide this forever"');
      const starterChecklist = page.locator('text="Hide this forever"');
      await starterChecklist.click();
    }
  }

  await page.locator('[data-slate-editor] h1').click();
}

interface SetupProps {
  page: Page;
  context: BrowserContext;
}

export async function setUp(
  { page, context }: SetupProps,
  options: SetupOptions = {}
) {
  await signOut(page);
  const { createAndNavigateToNewPad = true } = options;
  const newUser = await withTestUser({ page, context });
  await navigateToWorkspacePage(page);
  if (createAndNavigateToNewPad) {
    await Promise.all([
      page.waitForNavigation({ url: '/n/*' }),
      clickNewPadButton(page),
    ]);
    await waitForEditorToLoad(page, options);
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
  const name = await page.$('[data-slate-editor] h1');
  return (await name!.textContent())!.trim();
}

export async function focusOnBody(page: Page) {
  const firstP = await page.waitForSelector('[data-slate-editor] p >> nth=0');
  await firstP.click();
}

export async function keyPress(page: Page, k: string) {
  await page.waitForTimeout(Timeouts.typing);
  await page.keyboard.press(k);
  await page.waitForTimeout(Timeouts.typing);
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
