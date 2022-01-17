import { ElementHandle } from 'playwright';
import { nanoid } from 'nanoid';
import { Pad, User, WorkspaceRecord } from '@decipad/backendtypes';
import { pads } from '@decipad/services';
import tables from '@decipad/tables';
import { withNewUser, timeout } from '../utils';
import { clickNewPadButton, navigateToWorkspacePage } from './Workspace';
import { navigateToPlayground } from './Playground';
import { parseHTML, simplifyHTML } from '../utils/html';

interface SetupOptions {
  createAndNavigateToNewPad?: boolean;
}

export async function waitForEditorToLoad() {
  await page.waitForSelector('[contenteditable] h1');
}

export async function setUp(options: SetupOptions = {}) {
  const { createAndNavigateToNewPad = true } = options;
  const newUser = await withNewUser();
  await navigateToWorkspacePage();
  if (createAndNavigateToNewPad) {
    await Promise.all([
      clickNewPadButton(),
      page.waitForNavigation({ url: '/workspaces/*/pads/*' }),
    ]);
    await waitForEditorToLoad();
  }

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

export async function getPadContent() {
  return (
    await Promise.all(
      await (
        await Promise.all(
          await Promise.all(
            (
              await page.$$('[contenteditable]')
            ).map((element) => element.innerHTML())
          )
        )
      ).map(parseHTML)
    )
  )
    .flat()
    .map(simplifyHTML);
}

export async function getPadRoot($page = page): Promise<ElementHandle | null> {
  return $page.$('[data-slate-node="value"]');
}

export async function focusOnBody() {
  const $firstP = await page.$('[contenteditable] p >> nth=0');
  expect($firstP).not.toBeNull();
  await $firstP!.click();
}

export async function waitForSaveFlush() {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    // TODO: this is bad. Should wait for local storage to flush instead.
    page.waitForTimeout(500),
  ]);
}

export async function keyPress(k: string) {
  await page.keyboard.press(k);
  await timeout(250);
}

export async function createTable() {
  await keyPress('ArrowDown');
  await keyPress('Enter'); // And make a new line
  await page.keyboard.type('/table');
  await keyPress('Tab');
  await keyPress('Enter');
}

export async function writeInTable(text: string, columns = 1) {
  //
  // you need two tabs to get to the next value
  // when you have one column
  // spread is just to get a range from 0 to columns + 1
  //
  const tabs = [...Array(columns + 1).keys()].map(() => {
    return keyPress('Tab');
  });
  await Promise.all(tabs);
  await page.keyboard.type(text);
}

export async function navigateToNotebook(
  workspaceId: string,
  notebookId: string
) {
  await page.goto(`/workspaces/${workspaceId}/pads/pad-title:${notebookId}`);
}

export async function createPadFromUpdates(
  updates: string[],
  user: User,
  workspace: WorkspaceRecord
): Promise<Pad> {
  const newPad = await pads.create(workspace.id, { name: 'test pad' }, user);
  const data = await tables();
  await Promise.all(
    updates.map((update) =>
      data.docsyncupdates.put({
        id: `/pads/${newPad.id}`,
        seq: `${Date.now()}:${nanoid()}`,
        data: update,
      })
    )
  );

  return newPad;
}
